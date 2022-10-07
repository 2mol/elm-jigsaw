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
    , selectedTongue : Int

    -- Puzzle state
    , numberPieces : Int
    , voronoiPoints : Array ( Float, Float )
    , edgeTongues : Dict ( Int, Int ) ( Int, TongueOrientation )
    }


initNumberPieces : Int
initNumberPieces =
    100


init : () -> ( Model, Cmd Msg )
init _ =
    ( { dragState = DraggingNothing
      , draftMode = True
      , hoveringOver = HoverNothing
      , selectedTongue = 0
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
    | ToggleEdgeTongue ( Int, Int ) Int
    | ToggleDraftMode
    | Randomize
    | HoverOverSomething HoveringOverThing
    | SetNumberPieces Int
    | SetSelectedConnector Int


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

        ToggleEdgeTongue midpointCoordinates tongueIdx ->
            let
                currentState =
                    Dict.get midpointCoordinates model.edgeTongues

                newEdgeTongues =
                    case currentState of
                        Just ( i, Oneway ) ->
                            if i == tongueIdx then
                                Dict.insert midpointCoordinates ( tongueIdx, Theotherway ) model.edgeTongues

                            else
                                Dict.insert midpointCoordinates ( tongueIdx, Oneway ) model.edgeTongues

                        Just ( i, Theotherway ) ->
                            if i == tongueIdx then
                                Dict.remove midpointCoordinates model.edgeTongues

                            else
                                Dict.insert midpointCoordinates ( tongueIdx, Oneway ) model.edgeTongues

                        Nothing ->
                            Dict.insert midpointCoordinates ( tongueIdx, Oneway ) model.edgeTongues
            in
            { model | edgeTongues = newEdgeTongues }

        ToggleDraftMode ->
            { model | draftMode = not model.draftMode }

        HoverOverSomething thing ->
            { model | hoveringOver = thing }

        SetNumberPieces n ->
            { model | numberPieces = n }

        SetSelectedConnector i ->
            { model | selectedTongue = i }

        _ ->
            model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        newModel =
            updateModel msg model
    in
    case msg of
        Randomize ->
            ( newModel, Random.generate Init (genXYCoordinates model.numberPieces) )

        SetNumberPieces n ->
            ( newModel, Random.generate Init (genXYCoordinates n) )

        _ ->
            ( newModel, Cmd.none )



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
    div [ class "p-6 w-full max-w-3xl" ]
        [ buttonBar model
        , draw model
        , connectorSelectors model
        ]


connectorSelectors : Model -> Html Msg
connectorSelectors model =
    allConnectors
        |> List.indexedMap (connectorSelector model)
        |> div
            [ class "flex flex-wrap gap-2"
            , class "mt-2"
            ]


allConnectors : List Connector
allConnectors =
    [ baseWiggly
    , otherConnector
    , wConnector
    ]


testWiggly =
    """
<svg xmlns="http://www.w3.org/2000/svg" width="265.573" height="102.652"><g style="mix-blend-mode:normal"><path d="M-673.15-336.088c260.828-40.459 551.256 76.637 494.36-71.295-48.678-126.562-263.135-76.994-201.196-199.018 76.303-150.322 511.483-320.839 704.865-209.944C453.213-742.75 181.523-507.889 177.762-408.57c-3.76 99.317 247.851 37.899 499.463-23.52" fill="none" stroke="#000" stroke-width="5" stroke-dasharray="0" transform="matrix(.19667 0 0 .19667 132.386 167.539)" style="mix-blend-mode:normal"/></g></svg>
    """
        |> SvgParser.parseToNode



-- |> Result.withDefault (SvgParser.SvgText "")
-- |> extractConnectorSvg
-- |> SvgParser.nodeToSvg


extractConnectorPath : SvgParser.SvgNode -> Maybe String
extractConnectorPath node =
    case node of
        SvgParser.SvgElement element ->
            if element.name == "path" then
                List.filter (\( attr, _ ) -> attr == "d") element.attributes
                    |> List.head
                    |> Maybe.map Tuple.second

            else
                List.filterMap extractConnectorPath element.children
                    |> List.head

        _ ->
            Nothing


connectorSelectorSvg : Model -> String -> Html Msg
connectorSelectorSvg model connector =
    let
        width =
            120

        height =
            60

        normalizer =
            LineSegment2d.from (Point2d.unitless 5 height) (Point2d.unitless width height)
    in
    div
        [ class "border-4 border-yellow-400 hover:border-yellow-500 cursor-pointer"
        ]
        [ testWiggly
            |> Result.withDefault (SvgParser.SvgText "")
            |> SvgParser.nodeToSvg
        ]


connectorSelector : Model -> Int -> Connector -> Html Msg
connectorSelector model idx connector =
    let
        width =
            120

        height =
            80

        normalizerSegment =
            LineSegment2d.from (Point2d.unitless 5 (height / 2)) (Point2d.unitless width (height / 2))

        normalizedConnector =
            fitConnector connector normalizerSegment
    in
    div
        [ class "border-2 cursor-pointer"
        , if idx == model.selectedTongue then
            class "border-yellow-400"

          else
            class "border-gray-200 hover:border-gray-300"
        , HtmlE.onClick (SetSelectedConnector idx)
        ]
        [ simpleCanvas
            (width + 5)
            height
            [ drawConnector True normalizedConnector
            , drawDot 5 (round <| height / 2)
            , drawDot width (round <| height / 2)
            , Svg.g [] (drawAllControlPoints normalizedConnector)
            ]
        ]


drawAllControlPoints conn =
    let
        ( c0, cs, cn ) =
            conn
    in
    drawControlPoints c0
        :: drawControlPoints cn
        :: List.map drawControlPoints cs
        |> List.concat


drawControlPoints : CubicSpline2d Unitless () -> List (Svg Msg)
drawControlPoints spline =
    List.append
        (drawControlPoint (CubicSpline2d.firstControlPoint spline) (CubicSpline2d.secondControlPoint spline))
        (drawControlPoint (CubicSpline2d.fourthControlPoint spline) (CubicSpline2d.thirdControlPoint spline))


drawControlPoint pointAnchor pointHandle =
    let
        ( x0, y0 ) =
            pointToXY pointAnchor

        ( x1, y1 ) =
            pointToXY pointHandle
    in
    [ drawHollowDot x1 y1
    , drawDot x0 y0
    , Svg.line
        [ SvgA.x1 (String.fromInt x0)
        , SvgA.y1 (String.fromInt y0)
        , SvgA.x2 (String.fromInt x1)
        , SvgA.y2 (String.fromInt y1)
        , SvgA.strokeWidth "1"
        , SvgA.stroke "#aaa"
        ]
        []
    ]


pointToXY point =
    Point2d.coordinates point
        |> Tuple.mapBoth Quantity.toFloat Quantity.toFloat
        |> Tuple.mapBoth round round


drawDot : Int -> Int -> Svg msg
drawDot x y =
    Svg.circle
        [ SvgA.cx (String.fromInt x)
        , SvgA.cy (String.fromInt y)
        , SvgA.r "2"
        , SvgA.fill "black"
        , SvgA.fillOpacity "1"
        ]
        []


drawHollowDot : Int -> Int -> Svg Msg
drawHollowDot x y =
    Svg.circle
        [ SvgA.cx (String.fromInt x)
        , SvgA.cy (String.fromInt y)
        , SvgA.r "2"
        , SvgA.stroke "black"
        , SvgA.strokeWidth "1"
        , SvgA.fillOpacity "0"
        ]
        []


buttonBar : Model -> Html Msg
buttonBar model =
    div [ class "flex flex-wrap gap-2 py-2" ]
        [ buttonToggleDraft model.draftMode
        , buttonRandomize
        , div [ class "flex gap-0.5" ]
            [ buttonNumberPieces 20
            , buttonNumberPieces 50
            , buttonNumberPieces 100
            , buttonNumberPieces 250
            ]
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
        , class "whitespace-nowrap"
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
        , class "whitespace-nowrap"
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
                |> List.map (\e -> fitConnector (getEdgeConnector model.edgeTongues e) e)
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
            List.map (drawEdgeTarget model.selectedTongue) edgeSegments
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


getEdgeConnector : Dict ( Int, Int ) ( Int, TongueOrientation ) -> LineSegment2d Unitless coordinates -> Connector
getEdgeConnector edgeTongues edge =
    Dict.get (lineMidpoint edge) edgeTongues
        |> Maybe.map Tuple.first
        |> Maybe.andThen (\i -> List.getAt i allConnectors)
        |> Maybe.withDefault baseWiggly


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
    Dict ( Int, Int ) ( Int, TongueOrientation )
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
            (if isBeingHoveredOver && edgeHasTongue edgeTongues edge then
                "#999"

             else if isBeingHoveredOver then
                "crimson"

             else if edgeHasTongue edgeTongues edge then
                "#ccc"

             else
                "black"
            )
        , SvgA.strokeWidth "2"
        ]
        edge


drawEdgeTarget : Int -> LineSegment2d Unitless coordinates -> Svg Msg
drawEdgeTarget selectedTongue edge =
    let
        midpoint =
            lineMidpoint edge
    in
    Geometry.Svg.lineSegment2d
        [ SvgA.strokeWidth "16"
        , SvgA.stroke "red"
        , SvgA.strokeOpacity
            (if debugThis then
                "0.2"

             else
                "0"
            )
        , SvgE.onClick (ToggleEdgeTongue midpoint selectedTongue)
        , SvgE.onMouseOver (HoverOverSomething <| HoverEdge midpoint)
        , SvgE.onMouseOut (HoverOverSomething HoverNothing)
        ]
        edge


tongueFilterMap : Dict ( Int, Int ) ( Int, TongueOrientation ) -> LineSegment2d Unitless coordinates -> Maybe (LineSegment2d Unitless coordinates)
tongueFilterMap edgeDict edge =
    let
        flipIf ( _, orientation ) =
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
        [ SvgA.width "100%"
        , SvgA.height "auto"
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
                "#f3f3f3"

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
    ( CubicSpline2d Unitless ()
    , List (CubicSpline2d Unitless ())
    , CubicSpline2d Unitless ()
    )


baseWiggly : Connector
baseWiggly =
    let
        baseSpline =
            CubicSpline2d.fromControlPoints
                -- startpoint
                (Point2d.unitless 50 120)
                -- control points
                (Point2d.unitless 200 120)
                (Point2d.unitless 60 70)
                -- endpoint
                (Point2d.unitless 150 70)

        mirroredBaseSpline =
            CubicSpline2d.mirrorAcross Axis2d.y baseSpline
                |> CubicSpline2d.translateBy (Vector2d.unitless 300 0)
                |> CubicSpline2d.reverse
    in
    ( baseSpline, [], mirroredBaseSpline )


otherConnector : Connector
otherConnector =
    ( CubicSpline2d.fromControlPoints
        (Point2d.unitless -673.1506622609302 -336.08828223251044)
        (Point2d.unitless -412.32236311236807 -376.5467184031629)
        (Point2d.unitless -121.89363762679241 -259.4513483915769)
        (Point2d.unitless -178.7903504470044 -407.38280172412806)
    , [ CubicSpline2d.fromControlPoints
            (Point2d.unitless -178.7903504470044 -407.38280172412806)
            (Point2d.unitless -227.46810870269897 -533.9449731889339)
            (Point2d.unitless -441.92451764458133 -484.377343673999)
            (Point2d.unitless -379.9856748422326 -606.4010922720101)
      , CubicSpline2d.fromControlPoints
            (Point2d.unitless -379.9856748422326 -606.4010922720101)
            (Point2d.unitless -303.68264189813175 -756.7232760258798)
            (Point2d.unitless 131.49707496125012 -927.2397860201629)
            (Point2d.unitless 324.8791183706037 -816.3446201642428)
      , CubicSpline2d.fromControlPoints
            (Point2d.unitless 324.8791183706037 -816.3446201642428)
            (Point2d.unitless 453.21284360343077 -742.751490762477)
            (Point2d.unitless 181.52252270376036 -507.8894639452657)
            (Point2d.unitless 177.76238322632344 -408.57148891685074)
      ]
    , CubicSpline2d.fromControlPoints
        (Point2d.unitless 177.76238322632344 -408.57148891685074)
        (Point2d.unitless 174.0022437488865 -309.2535138884358)
        (Point2d.unitless 425.6134722463662 -370.67249098907445)
        (Point2d.unitless 677.2247007438457 -432.0914680897131)
    )


wConnector : Connector
wConnector =
    ( CubicSpline2d.fromControlPoints
        (Point2d.unitless 183.71383281146154 201.92756843684776)
        (Point2d.unitless 206.74253566000846 165.9164365940892)
        (Point2d.unitless 229.77123850855537 129.9053047513306)
        (Point2d.unitless 235.7088804661762 155.9427369251132)
    , [ CubicSpline2d.fromControlPoints
            (Point2d.unitless 235.7088804661762 155.9427369251132)
            (Point2d.unitless 241.64652242379702 181.9801690988958)
            (Point2d.unitless 203.2578220546626 273.6272320736138)
            (Point2d.unitless 238.44686782020062 270.6043048973007)
      , CubicSpline2d.fromControlPoints
            (Point2d.unitless 238.44686782020062 270.6043048973007)
            (Point2d.unitless 262.6351636660783 268.526400956728)
            (Point2d.unitless 277.2258775787624 171.00481124428285)
            (Point2d.unitless 289.84089386061737 175.72302605345442)
      , CubicSpline2d.fromControlPoints
            (Point2d.unitless 289.84089386061737 175.72302605345442)
            (Point2d.unitless 324.0999480499445 188.53645199066816)
            (Point2d.unitless 311.9178886218489 237.50363859431775)
            (Point2d.unitless 327.0641658394743 250.196282082915)
      ]
    , CubicSpline2d.fromControlPoints
        (Point2d.unitless 327.0641658394743 250.196282082915)
        (Point2d.unitless 342.2104430570997 262.88892557151223)
        (Point2d.unitless 366.805316849104 218.08389853007736)
        (Point2d.unitless 391.4001906411081 173.2788714886425)
    )


fitConnector : Connector -> LineSegment2d Unitless () -> Connector
fitConnector ( w1, splines, w2 ) segment =
    let
        startPoint =
            CubicSpline2d.startPoint w1

        endPoint =
            CubicSpline2d.endPoint w2

        pivot =
            startPoint

        length =
            Point2d.distanceFrom startPoint endPoint
                |> Quantity.toFloat

        segmentLen =
            LineSegment2d.length segment |> Quantity.toFloat

        scale spline =
            CubicSpline2d.scaleAbout pivot (1 / length * segmentLen) spline

        translationVector =
            Vector2d.from pivot (LineSegment2d.startPoint segment)

        connectorDir =
            Vector2d.from startPoint endPoint
                |> Vector2d.direction
                |> Maybe.withDefault (Direction2d.radians 0)

        segmentDir =
            LineSegment2d.vector segment
                |> Vector2d.direction
                |> Maybe.withDefault (Direction2d.radians 0)

        rotationAngle =
            Direction2d.angleFrom connectorDir segmentDir

        fit w =
            scale w
                |> CubicSpline2d.translateBy translationVector
                |> CubicSpline2d.rotateAround (LineSegment2d.startPoint segment) rotationAngle
    in
    ( fit w1
    , List.map fit splines
    , fit w2
    )


drawConnector : Bool -> Connector -> Svg msg
drawConnector draftMode ( w1, splines, w2 ) =
    let
        drawSpline spline =
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
    drawSpline w1
        :: drawSpline w2
        :: List.map drawSpline splines
        |> Svg.g []
