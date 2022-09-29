module Voronoi exposing (main)

import Angle
import Array exposing (Array)
import Axis2d
import BoundingBox2d
import Browser
import Browser.Events as E
import CubicSpline2d exposing (CubicSpline2d)
import Dict exposing (Dict)
import Direction2d
import Geometry.Svg
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
import Html.Events as HtmlE
import Json.Decode as Decode exposing (Decoder)
import LineSegment2d exposing (LineSegment2d)
import List.Extra as List
import Point2d
import Polygon2d
import Quantity exposing (Unitless)
import Random
import Result
import Svg exposing (Svg)
import Svg.Attributes as SvgA
import Svg.Events as SvgE
import SvgParser
import Vector2d
import VoronoiDiagram2d


debugThis : Bool
debugThis =
    False



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type DragState
    = DraggingNothing
    | DraggingMarker Int (Maybe ( Float, Float ))


type TongueOrientation
    = Oneway
    | Theotherway


type HoveringOverThing
    = HoverEdge ( Int, Int )
    | HoverMarker ( Int, Int )
    | HoverNothing


type alias Model =
    { -- ephemereal UI state
      dragState : DragState
    , draftMode : Bool
    , hoveringOver : HoveringOverThing

    -- Puzzle state
    , numberPieces : Int
    , voronoiPoints : Array ( Float, Float )
    , edgeTongues : Dict ( Int, Int ) TongueOrientation
    }


initNumberPieces : Int
initNumberPieces =
    100


init : () -> ( Model, Cmd Msg )
init _ =
    ( { dragState = DraggingNothing
      , draftMode = True
      , hoveringOver = HoverNothing
      , numberPieces = initNumberPieces
      , voronoiPoints = Array.empty
      , edgeTongues = Dict.empty
      }
    , Random.generate Init (genXYCoordinates initNumberPieces)
    )


genXCoordinates : Int -> Random.Generator (List Float)
genXCoordinates n =
    Random.list n (Random.int 0 800)
        |> (Random.map << List.map) toFloat


genYCoordinates : Int -> Random.Generator (List Float)
genYCoordinates n =
    Random.list n (Random.int 0 600)
        |> (Random.map << List.map) toFloat


genXYCoordinates : Int -> Random.Generator (List ( Float, Float ))
genXYCoordinates n =
    Random.map2 List.zip (genXCoordinates n) (genYCoordinates n)



-- UPDATE


type Msg
    = NoOp
    | Init (List ( Float, Float ))
    | DragStart Int
    | DragMoving Int Bool Int Int
    | DragStop
    | ToggleEdgeTongue ( Int, Int )
    | ToggleDraftMode
    | Randomize
    | HoverOverSomething HoveringOverThing
    | SetNumberPieces Int


updateModel : Msg -> Model -> Model
updateModel msg model =
    case msg of
        Init coord ->
            { model | voronoiPoints = List.unique coord |> Array.fromList }

        DragStart idx ->
            { model | dragState = DraggingMarker idx Nothing }

        DragStop ->
            -- TODO: prune dict of edge connectors here
            { model | dragState = DraggingNothing }

        DragMoving idx isDown x y ->
            if isDown then
                let
                    dragState =
                        case model.dragState of
                            DraggingMarker _ Nothing ->
                                -- Saving the first offset x,y coordinates so that we can take the relative diff
                                DraggingMarker idx (Maybe.map (\( px, py ) -> ( toFloat x - px, toFloat y - py )) (Array.get idx model.voronoiPoints))

                            _ ->
                                model.dragState
                in
                { model
                    | dragState = dragState
                    , voronoiPoints =
                        case dragState of
                            DraggingMarker _ (Just ( offsetX, offsetY )) ->
                                Array.set idx ( toFloat x - offsetX, toFloat y - offsetY ) model.voronoiPoints

                            _ ->
                                model.voronoiPoints
                }

            else
                { model | dragState = DraggingNothing }

        ToggleEdgeTongue midpointCoordinates ->
            let
                currentState =
                    Dict.get midpointCoordinates model.edgeTongues

                newEdgeTongues =
                    case currentState of
                        Just Oneway ->
                            Dict.insert midpointCoordinates Theotherway model.edgeTongues

                        Just Theotherway ->
                            Dict.remove midpointCoordinates model.edgeTongues

                        Nothing ->
                            Dict.insert midpointCoordinates Oneway model.edgeTongues
            in
            { model | edgeTongues = newEdgeTongues }

        ToggleDraftMode ->
            { model | draftMode = not model.draftMode }

        HoverOverSomething thing ->
            { model | hoveringOver = thing }

        SetNumberPieces n ->
            { model | numberPieces = n }

        _ ->
            model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Randomize ->
            ( model, Random.generate Init (genXYCoordinates model.numberPieces) )

        SetNumberPieces n ->
            ( model, Random.generate Init (genXYCoordinates n) )

        _ ->
            ( updateModel msg model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.dragState of
        DraggingNothing ->
            Sub.none

        DraggingMarker idx _ ->
            Sub.batch
                [ E.onMouseMove
                    (Decode.map3 (DragMoving idx)
                        decodeButtonZombieDrag
                        (Decode.field "pageX" Decode.int)
                        (Decode.field "pageY" Decode.int)
                    )
                , E.onMouseUp (Decode.succeed DragStop)
                ]


decodeButtonZombieDrag : Decoder Bool
decodeButtonZombieDrag =
    Decode.field "buttons" (Decode.map (\buttons -> buttons == 1) Decode.int)



-- VIEW


view : Model -> Html Msg
view model =
    div [ class "pt-6" ]
        [ buttonBar model
        , draw model
        , [ baseWiggly, baseWiggly, baseWiggly, baseWiggly ]
            |> List.map (connectorSelector model)
            |> div
                [ class "flex flex-row space-x-2"
                , class "mt-2"

                -- , class "border border-gray-300"
                ]
        ]


connectorSelector : Model -> Connector -> Html Msg
connectorSelector model connector =
    let
        width =
            120

        height =
            60

        normalizer =
            LineSegment2d.from (Point2d.unitless 5 height) (Point2d.unitless width height)
    in
    div [ class "border-4 border-yellow-400 hover:border-yellow-500 cursor-pointer" ]
        [ simpleCanvas (width + 5)
            (height + 5)
            [ fitConnector connector normalizer
                |> drawConnector True
            , Svg.circle
                [ SvgA.cx "5"
                , SvgA.cy (String.fromInt height)
                , SvgA.r "3"
                , SvgA.fill "black"
                , SvgA.fillOpacity "1"
                ]
                []
            , Svg.circle
                [ SvgA.cx (String.fromInt width)
                , SvgA.cy (String.fromInt height)
                , SvgA.r "3"
                , SvgA.fill "black"
                , SvgA.fillOpacity "1"
                ]
                []
            ]
        ]


buttonBar : Model -> Html Msg
buttonBar model =
    div [ class "flex space-x-2 py-2" ]
        [ buttonToggleDraft model.draftMode
        , buttonRandomize
        , buttonNumberPieces 20
        , buttonNumberPieces 50
        , buttonNumberPieces 100
        , buttonNumberPieces 250
        ]


buttonNumberPieces : Int -> Html Msg
buttonNumberPieces n =
    Html.button
        [ class "bg-slate-500 hover:bg-slate-400 text-white font-bold py-2 px-4 rounded"
        , class "text-center inline-flex items-center"
        , HtmlE.onClick (SetNumberPieces n)
        ]
        [ text <| String.fromInt n ]


draftFalseIcon : Html msg
draftFalseIcon =
    """
<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 -ml-1 w-5 h-5" width="24" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <path d="M10.003 9.997l-6.003 6.003v4h4l6.006 -6.006m1.99 -1.99l2.504 -2.504a2.828 2.828 0 1 0 -4 -4l-2.5 2.5"></path>
   <path d="M13.5 6.5l4 4"></path>
   <path d="M3 3l18 18"></path>
</svg>
    """
        |> SvgParser.parse
        |> Result.withDefault (text "")


draftTrueIcon : Html msg
draftTrueIcon =
    """
<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 -ml-1 w-5 h-5" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
   <line x1="13.5" y1="6.5" x2="17.5" y2="10.5"></line>
</svg>
    """
        |> SvgParser.parse
        |> Result.withDefault (text "")


buttonToggleDraft : Bool -> Html Msg
buttonToggleDraft draftMode =
    Html.button
        [ class "font-bold py-2 px-4 rounded"
        , class "text-center inline-flex items-center"
        , if draftMode then
            class "bg-blue-300 hover:bg-blue-200"

          else
            class "draft"
        , HtmlE.onClick ToggleDraftMode
        ]
        [ if draftMode then
            draftFalseIcon

          else
            draftTrueIcon
        , text "toggle draft mode"
        ]


randomIcon : Html msg
randomIcon =
    """
<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 -ml-1 w-5 h-5" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <path d="M20 21.004h-4v-4"></path>
   <path d="M16 21.004l5 -5"></path>
   <path d="M6.5 9.504l-3.5 -2l2 -3.504"></path>
   <path d="M3 7.504l6.83 -1.87"></path>
   <path d="M4 16.004l4 -1l1 4"></path>
   <path d="M8 15.004l-3.5 6"></path>
   <path d="M21 5.004l-.5 4l-4 -.5"></path>
   <path d="M20.5 9.004l-4.5 -5.5"></path>
</svg>
    """
        |> SvgParser.parse
        |> Result.withDefault (text "")


buttonRandomize : Html Msg
buttonRandomize =
    Html.button
        [ class "bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
        , class "text-center inline-flex items-center"
        , HtmlE.onClick Randomize
        ]
        [ randomIcon, text "randomize" ]



-- THE REST OF THE FUCKING OWL


draw : Model -> Html Msg
draw model =
    let
        points =
            Array.map (\( x, y ) -> Point2d.unitless x y) model.voronoiPoints

        markerCoords =
            Array.map Point2d.toUnitless points
                |> Array.map (\p -> ( round p.x, round p.y ))

        markers =
            markerCoords
                |> Array.map (drawMarker model.hoveringOver)
                |> Array.toList

        markerTargets =
            markerCoords
                |> Array.indexedMap drawMarkerTarget
                |> Array.toList

        voronoi =
            VoronoiDiagram2d.fromPoints points
                |> Result.withDefault VoronoiDiagram2d.empty

        polygons =
            VoronoiDiagram2d.polygons
                (BoundingBox2d.from (Point2d.unitless 0 0) (Point2d.unitless 800 600))
                voronoi

        edgeSegments =
            List.map Tuple.second polygons
                |> List.concatMap Polygon2d.edges
                |> List.uniqueBy lineMidpoint

        tongues =
            edgeSegments
                |> List.filterMap (tongueFilterMap model.edgeTongues)
                |> List.map (fitConnector baseWiggly)
                |> List.map (drawConnector model.draftMode)

        edges =
            edgeSegments
                |> List.filter
                    (if model.draftMode then
                        always True

                     else
                        not << edgeHasTongue model.edgeTongues
                    )
                |> List.map (drawEdge model.edgeTongues model.hoveringOver)

        edgeTargets =
            List.map drawEdgeTarget edgeSegments
    in
    canvas model
        800
        600
        (if model.draftMode then
            [ Svg.g [] edges
            , Svg.g [] markers
            , Svg.g [] tongues
            , Svg.g [] edgeTargets
            , Svg.g [] markerTargets
            ]

         else
            [ Svg.g [] edges

            -- , Svg.g [] markers
            , Svg.g [] tongues
            , Svg.g [] edgeTargets

            -- , Svg.g [] markerTargets
            ]
        )


lineMidpoint : LineSegment2d Unitless coordinates -> ( Int, Int )
lineMidpoint lineSegment =
    -- a little "trick" to compare edges for equality
    -- independent of orientation: just compare their midpoint
    LineSegment2d.midpoint lineSegment
        |> Point2d.toUnitless
        |> (\{ x, y } -> ( round x, round y ))


edgeHasTongue : Dict ( Int, Int ) v -> LineSegment2d Unitless coordinates -> Bool
edgeHasTongue edgeTongues edge =
    Dict.member (lineMidpoint edge) edgeTongues



-- SVG HELPERS


drawMarker : HoveringOverThing -> ( Int, Int ) -> Svg Msg
drawMarker hoverThing ( xc, yc ) =
    let
        isBeingHoveredOver =
            hoverThing == HoverMarker ( xc, yc )
    in
    Svg.circle
        [ SvgA.cx <| String.fromInt xc
        , SvgA.cy <| String.fromInt yc
        , SvgA.r "3"
        , SvgA.fill "crimson"
        , SvgA.fillOpacity
            (if isBeingHoveredOver then
                "1"

             else
                "0"
            )
        , SvgA.stroke
            (if isBeingHoveredOver then
                "crimson"

             else
                "black"
            )
        , SvgA.strokeWidth "1"
        ]
        []


drawMarkerTarget : Int -> ( Int, Int ) -> Svg Msg
drawMarkerTarget idx ( xc, yc ) =
    Svg.circle
        [ SvgA.cx <| String.fromInt xc
        , SvgA.cy <| String.fromInt yc
        , SvgA.r "8"
        , SvgA.fill "red"
        , SvgA.fillOpacity
            (if debugThis then
                "0.2"

             else
                "0"
            )
        , SvgE.on "mousedown" (Decode.succeed (DragStart idx))
        , SvgE.onMouseOver (HoverOverSomething <| HoverMarker ( xc, yc ))
        , SvgE.onMouseOut (HoverOverSomething HoverNothing)
        ]
        []


drawEdge :
    Dict ( Int, Int ) TongueOrientation
    -> HoveringOverThing
    -> LineSegment2d Unitless coordinates
    -> Svg Msg
drawEdge edgeTongues hoverThing edge =
    let
        midpoint =
            lineMidpoint edge

        isBeingHoveredOver =
            hoverThing == HoverEdge midpoint
    in
    Geometry.Svg.lineSegment2d
        [ SvgA.stroke
            (if isBeingHoveredOver then
                "crimson"

             else if edgeHasTongue edgeTongues edge then
                "#aaa"

             else
                "black"
            )
        , SvgA.strokeWidth "2"
        ]
        edge


drawEdgeTarget :
    LineSegment2d Unitless coordinates
    -> Svg Msg
drawEdgeTarget edge =
    let
        midpoint =
            lineMidpoint edge
    in
    Geometry.Svg.lineSegment2d
        [ SvgA.strokeWidth "16"
        , SvgA.stroke "red"

        -- , SvgA.strokeOpacity "0.2"
        , SvgA.strokeOpacity
            (if debugThis then
                "0.2"

             else
                "0"
            )
        , SvgE.onClick (ToggleEdgeTongue midpoint)
        , SvgE.onMouseOver (HoverOverSomething <| HoverEdge midpoint)
        , SvgE.onMouseOut (HoverOverSomething HoverNothing)
        ]
        edge


tongueFilterMap : Dict ( Int, Int ) TongueOrientation -> LineSegment2d Unitless coordinates -> Maybe (LineSegment2d Unitless coordinates)
tongueFilterMap edgeDict edge =
    let
        flipIf orientation =
            case orientation of
                Oneway ->
                    edge

                Theotherway ->
                    flip edge
    in
    Dict.get (lineMidpoint edge) edgeDict
        |> Maybe.map flipIf


flip : LineSegment2d Unitless coordinates -> LineSegment2d Unitless coordinates
flip segment =
    let
        pivot =
            LineSegment2d.midpoint segment

        angle =
            Angle.degrees 180
    in
    LineSegment2d.rotateAround pivot angle segment



-- CANVAS HELPERS


canvas : Model -> Int -> Int -> List (Svg Msg) -> Html Msg
canvas model w h children =
    let
        hStr =
            String.fromInt h

        wStr =
            String.fromInt w

        tileSize =
            10

        xnumtiles =
            w // tileSize

        ynumtiles =
            h // tileSize

        tiles =
            List.lift2 (tile tileSize)
                (List.range 0 <| xnumtiles - 1)
                (List.range 0 <| ynumtiles - 1)

        border =
            Svg.rect
                [ SvgA.x "1"
                , SvgA.y "1"
                , SvgA.width (String.fromInt <| w - 2)
                , SvgA.height (String.fromInt <| h - 2)
                , SvgA.stroke "black"
                , SvgA.strokeWidth "2"
                , SvgA.fillOpacity "0"
                ]
                []
    in
    Svg.svg
        [ SvgA.width wStr
        , SvgA.height hStr
        , SvgA.viewBox <| "0 0 " ++ wStr ++ " " ++ hStr
        ]
        [ Svg.g []
            (if model.draftMode then
                tiles

             else
                []
            )
        , border
        , Svg.g [] children
        ]


simpleCanvas : Int -> Int -> List (Svg msg) -> Html msg
simpleCanvas width height content =
    Svg.svg
        [ SvgA.width (String.fromInt width)
        , SvgA.height (String.fromInt height)
        , [ 0, 0, width, height ]
            |> List.map String.fromInt
            |> String.join " "
            |> SvgA.viewBox
        ]
        content


tile : Int -> Int -> Int -> Svg Msg
tile size xc yc =
    let
        col =
            if modBy 2 (xc + yc) == 0 then
                "#eeeeee"

            else
                "#ffffff"
    in
    Svg.rect
        [ SvgA.x (String.fromInt (xc * size))
        , SvgA.y (String.fromInt (yc * size))
        , SvgA.width (String.fromInt size)
        , SvgA.height (String.fromInt size)
        , SvgA.fill col
        ]
        []



-- TONGUES


type alias Connector =
    ( CubicSpline2d Unitless (), CubicSpline2d Unitless () )


baseWiggly : Connector
baseWiggly =
    let
        baseShape =
            CubicSpline2d.fromControlPoints
                -- startpoint
                (Point2d.unitless 50 120)
                -- control points
                (Point2d.unitless 200 120)
                (Point2d.unitless 60 70)
                -- endpoint
                (Point2d.unitless 150 70)

        mirroredBaseShape =
            CubicSpline2d.mirrorAcross Axis2d.y baseShape
                |> CubicSpline2d.translateBy (Vector2d.unitless 300 0)
    in
    ( baseShape, mirroredBaseShape )


fitConnector : Connector -> LineSegment2d Unitless () -> Connector
fitConnector ( w1, w2 ) segment =
    let
        pivot =
            CubicSpline2d.startPoint w1

        segmentLen =
            LineSegment2d.length segment |> Quantity.toFloat

        scale spline =
            CubicSpline2d.scaleAbout pivot (1 / 200 * segmentLen) spline

        translationVector =
            Vector2d.from pivot (LineSegment2d.startPoint segment)

        rotationAngle =
            LineSegment2d.vector segment
                |> Vector2d.direction
                |> Maybe.withDefault (Direction2d.radians 0)
                |> Direction2d.toAngle

        fit w =
            scale w
                |> CubicSpline2d.translateBy translationVector
                |> CubicSpline2d.rotateAround (LineSegment2d.startPoint segment) rotationAngle
    in
    ( fit w1
    , fit w2
    )


drawConnector : Bool -> Connector -> Svg msg
drawConnector draftMode ( w1, w2 ) =
    let
        drawHalf spline =
            Geometry.Svg.cubicSpline2d
                [ SvgA.stroke
                    (if draftMode then
                        "crimson"

                     else
                        "black"
                    )
                , SvgA.fillOpacity "0"
                , SvgA.strokeWidth "2"
                ]
                spline
    in
    Svg.g [] [ drawHalf w1, drawHalf w2 ]
