module Voronoi exposing (main)

import Array exposing (Array)
import BoundingBox2d
import Browser exposing (Document)
import Browser.Events as E
import Geometry.Svg
import Html exposing (Html)
import Html.Attributes as HtmlA
import Html.Events as HtmlE
import Json.Decode as Decode
import List.Extra as List
import Point2d
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
    = DragNothing
    | DragMarker


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
      , dragState = DragNothing
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
    , Random.generate Init bla
    )


blax : Random.Generator (List Float)
blax =
    Random.list 100 (Random.int 0 800)
        |> (Random.map << List.map) toFloat


blay : Random.Generator (List Float)
blay =
    Random.list 100 (Random.int 0 600)
        |> (Random.map << List.map) toFloat


bla : Random.Generator (Array ( Float, Float ))
bla =
    Random.map2 List.zip blax blay
        |> Random.map Array.fromList



-- UPDATE


type Msg
    = NoOp
    | Init (Array ( Float, Float ))
    | DragStart
    | DragMoving Int Int
    | DragStop
    | ClickedMarker


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        Init coord ->
            ( { model | voronoiPoints = coord }, Cmd.none )

        DragStart ->
            ( { model | dragState = DragMarker }, Cmd.none )

        DragMoving x y ->
            ( { model
                | debugMessage =
                    "You moved the mouse to page coordinates "
                        ++ String.fromInt x
                        ++ ", "
                        ++ String.fromInt y
              }
            , Cmd.none
            )

        ClickedMarker ->
            ( { model
                | debugMessage =
                    "clickeeeey"
              }
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.dragState of
        DragNothing ->
            Sub.none

        DragMarker ->
            let
                _ =
                    Debug.log "test" 123
            in
            Sub.batch
                [ E.onMouseMove
                    (Decode.map2 DragMoving
                        (Decode.field "pageX" Decode.int)
                        (Decode.field "pageY" Decode.int)
                    )

                -- , E.onMouseUp (Decode.map DragStop)
                ]



-- VIEW


view : Model -> Document Msg
view model =
    { title = "puzzleface"
    , body =
        [ Html.text model.debugMessage
        , Html.br [] []
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
                |> Array.map marker
                |> Array.toList

        voronoi =
            VoronoiDiagram2d.fromPoints points
                |> Result.withDefault VoronoiDiagram2d.empty

        polygons =
            VoronoiDiagram2d.polygons
                (BoundingBox2d.from (Point2d.unitless 0 0) (Point2d.unitless 800 600))
                voronoi

        svgPolygons =
            List.map
                (\( _, p ) -> Geometry.Svg.polygon2d [ SvgA.stroke "#555555", SvgA.fillOpacity "0" ] p)
                polygons
    in
    canvas
        800
        600
        [ Svg.g [] svgPolygons
        , Svg.g [] markers
        ]



-- SVG HELPERS


marker : ( Int, Int ) -> Svg Msg
marker ( xc, yc ) =
    Svg.circle
        [ SvgA.cx <| String.fromInt xc
        , SvgA.cy <| String.fromInt yc
        , SvgA.r "3"
        , SvgA.class "marker"
        , SvgA.fill "white"
        , SvgA.stroke "black"
        , SvgA.strokeWidth "1"

        -- , HtmlE.onClick ClickedMarker
        , SvgE.on "mousedown" (Decode.succeed DragStart)
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
