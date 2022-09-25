module Voronoi exposing (main)

import Angle
import Array exposing (Array)
import Axis2d
import BoundingBox2d
import Browser exposing (Document)
import Browser.Events as E
import CubicSpline2d exposing (CubicSpline2d)
import Dict exposing (Dict)
import Direction2d
import Geometry.Svg
import Html exposing (Html, div, text)
import Html.Attributes as HtmlA exposing (class)
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
import Vector2d
import VoronoiDiagram2d



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


type alias Model =
    { -- ephemereal UI state
      dragState : DragState
    , draftMode : Bool

    -- Puzzle state
    , numberPieces : Int
    , voronoiPoints : Array ( Float, Float )
    , edgeTongues : Dict ( Int, Int ) TongueOrientation
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { dragState = DraggingNothing
      , draftMode = True
      , numberPieces = 100
      , voronoiPoints = Array.empty
      , edgeTongues = Dict.empty
      }
    , Random.generate Init (genXYCoordinates 150)
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

        _ ->
            model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Randomize ->
            ( model, Random.generate Init (genXYCoordinates 150) )

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
    div [ class "pt-8" ]
        [ div [ class "flex space-x-2 py-2" ]
            [ buttonToggleDraft
            , buttonRandomize

            -- , buttonToggleDraft
            ]
        , draw model
        ]


buttonToggleDraft =
    Html.button
        [ class "font-bold py-2 px-4 rounded"
        , class "draft"
        , HtmlE.onClick ToggleDraftMode
        ]
        [ text "draft mode" ]


randomIcon =
    """
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-random" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
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


buttonRandomize =
    Html.button
        [ class "bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-2 px-4 rounded"
        , class "text-center inline-flex items-center"
        , HtmlE.onClick Randomize
        ]
        [ text "randomize" ]



-- THE REST OF THE FUCKING OWL


draw : Model -> Html Msg
draw model =
    let
        points =
            Array.map (\( x, y ) -> Point2d.unitless x y) model.voronoiPoints

        markers =
            Array.map Point2d.toUnitless points
                |> Array.map (\p -> ( round p.x, round p.y ))
                |> Array.indexedMap marker
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
                |> List.uniqueBy lineCoord

        tongues =
            edgeSegments
                |> List.filterMap (tongueFilterMap model.edgeTongues)
                |> List.map (fitWiggly baseWiggly)
                |> List.map (drawWiggly model.draftMode)

        edges =
            edgeSegments
                |> List.filter
                    (if model.draftMode then
                        always True

                     else
                        not << edgeHasTongue model.edgeTongues
                    )
                |> List.map (drawEdge model.edgeTongues)
    in
    canvas model
        800
        600
        [ Svg.g [] edges
        , Svg.g [] markers
        , Svg.g [] tongues

        -- , drawWiggly baseWiggly
        -- , Svg.g []
        --     (List.map2
        --         (\x y ->
        --             Svg.circle
        --                 [ SvgA.cx <| String.fromInt x
        --                 , SvgA.cy <| String.fromInt y
        --                 , SvgA.r "1"
        --                 , SvgA.stroke "crimson"
        --                 , SvgA.strokeWidth "1"
        --                 ]
        --                 []
        --         )
        --         (List.map ((*) 10) (List.range 0 50))
        --         (List.map ((*) 10) (List.range 0 50))
        --     )
        ]


lineCoord : LineSegment2d Unitless coordinates -> ( Int, Int )
lineCoord lineSegment =
    -- a little "trick" to compare edges for equality
    -- independent of orientation: just compare their midpoint
    LineSegment2d.midpoint lineSegment
        |> Point2d.toUnitless
        |> (\{ x, y } -> ( round x, round y ))


edgeHasTongue : Dict ( Int, Int ) v -> LineSegment2d Unitless coordinates -> Bool
edgeHasTongue edgeTongues edge =
    Dict.member (lineCoord edge) edgeTongues



-- SVG HELPERS


marker : Int -> ( Int, Int ) -> Svg Msg
marker idx ( xc, yc ) =
    Svg.circle
        [ SvgA.cx <| String.fromInt xc
        , SvgA.cy <| String.fromInt yc
        , SvgA.r "3"
        , SvgA.fillOpacity "0"
        , SvgA.stroke "black"
        , SvgA.strokeOpacity "0.75"
        , SvgA.strokeWidth "1.5"
        , SvgE.on "mousedown" (Decode.succeed (DragStart idx))
        ]
        []


drawEdge : Dict ( Int, Int ) TongueOrientation -> LineSegment2d Unitless coordinates -> Svg Msg
drawEdge edgeTongues edge =
    Geometry.Svg.lineSegment2d
        [ SvgA.stroke
            (if edgeHasTongue edgeTongues edge then
                "#aaa"

             else
                "black"
            )
        , SvgA.strokeWidth "2"
        , SvgE.onClick (ToggleEdgeTongue (lineCoord edge))
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
    Dict.get (lineCoord edge) edgeDict
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
                [ SvgA.x "2"
                , SvgA.y "2"
                , SvgA.width (String.fromInt <| w - 4)
                , SvgA.height (String.fromInt <| h - 4)
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


type alias Wiggly =
    ( CubicSpline2d Unitless (), CubicSpline2d Unitless () )


baseWiggly : Wiggly
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


fitWiggly : Wiggly -> LineSegment2d Unitless () -> Wiggly
fitWiggly ( w1, w2 ) segment =
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


drawWiggly : Bool -> Wiggly -> Svg msg
drawWiggly draftMode ( w1, w2 ) =
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
