module Voronoi exposing (main)

import Array exposing (Array)
import BoundingBox2d
import Browser exposing (Document)
import Browser.Events as E
import Geometry.Svg
import Html exposing (Html)
import Html.Attributes as HtmlA
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
import VoronoiDiagram2d



-- MAIN


main : Program () Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type DragState
    = DraggingNothing
    | DraggingMarker Int (Maybe ( Float, Float ))


type alias Model =
    { debugMessage : String

    -- ephemereal UI state
    , dragState : DragState

    -- Puzzle state
    , numberPieces : Int
    , voronoiPoints : Array ( Float, Float )
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { debugMessage = "empty"
      , dragState = DraggingNothing
      , numberPieces = 100
      , voronoiPoints = Array.empty

      --   , puzzle =
      --         { piecesX = 18
      --         , piecesY = 13
      --         , gridPerturb = 3
      --         , seed = Random.initialSeed 768
      --         , draftMode = True
      --         }
      }
    , Random.generate Init genXYCoordinates
    )


genXCoordinates : Random.Generator (List Float)
genXCoordinates =
    Random.list 100 (Random.int 0 800)
        |> (Random.map << List.map) toFloat


genYCoordinates : Random.Generator (List Float)
genYCoordinates =
    Random.list 100 (Random.int 0 600)
        |> (Random.map << List.map) toFloat


genXYCoordinates : Random.Generator (Array ( Float, Float ))
genXYCoordinates =
    Random.map2 List.zip genXCoordinates genYCoordinates
        |> Random.map Array.fromList



-- UPDATE


type Msg
    = NoOp
    | Init (Array ( Float, Float ))
    | DragStart Int
    | DragMoving Int Bool Int Int
    | DragStop


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Init coord ->
            ( { model | voronoiPoints = coord }, Cmd.none )

        DragStart idx ->
            ( { model | dragState = DraggingMarker idx Nothing }, Cmd.none )

        DragStop ->
            ( { model | dragState = DraggingNothing }, Cmd.none )

        DragMoving idx isDown x y ->
            ( if isDown then
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
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )



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


view : Model -> Document Msg
view model =
    { title = "puzzleface"
    , body =
        [ Html.text ""
        , draw model
        ]
    }



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

        -- svgPolygons =
        --     List.map
        --         (\( _, p ) -> Geometry.Svg.polygon2d [ SvgA.stroke "#555555", SvgA.fillOpacity "0" ] p)
        --         polygons
        -- lineCoord : LineSegment2d Unitless coordinates -> ( Int, Int )
        lineCoord lineSegment =
            -- a little "trick" to compare edges for equality
            -- independent of orientation: just compare their midpoint
            LineSegment2d.midpoint lineSegment
                |> Point2d.toUnitless
                |> (\{ x, y } -> ( round x, round y ))

        edges =
            List.map Tuple.second polygons
                |> List.concatMap Polygon2d.edges
                |> List.uniqueBy lineCoord

        edgeAttrs =
            if True then
                [ SvgA.stroke "#555555", SvgA.fillOpacity "0" ]

            else
                [ SvgA.stroke "#999", SvgA.strokeDasharray "2", SvgA.fillOpacity "0" ]

        svgEdges =
            List.map
                (Geometry.Svg.lineSegment2d edgeAttrs)
                edges
    in
    canvas
        800
        600
        [ Svg.g [] svgEdges
        , Svg.g [] markers
        ]



-- SVG HELPERS


marker : Int -> ( Int, Int ) -> Svg Msg
marker idx ( xc, yc ) =
    Svg.circle
        [ SvgA.cx <| String.fromInt xc
        , SvgA.cy <| String.fromInt yc
        , SvgA.r "3"
        , SvgA.class "marker"
        , SvgA.fill "white"
        , SvgA.stroke "black"
        , SvgA.strokeWidth "1"
        , SvgE.on "mousedown" (Decode.succeed (DragStart idx))
        ]
        []



-- CANVAS HELPERS


canvas : Int -> Int -> List (Svg Msg) -> Html Msg
canvas w h children =
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
                [ SvgA.x "0"
                , SvgA.y "0"
                , SvgA.width wStr
                , SvgA.height hStr
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
        [ Svg.g [] tiles
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
