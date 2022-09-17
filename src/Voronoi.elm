module Voronoi exposing (main)

import Array
import BoundingBox2d
import Browser exposing (Document)
import Browser.Events exposing (onMouseMove)
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


type alias Model =
    { debugMessage : String

    -- ephemereal UI state
    -- Puzzle state
    , numberPieces : Int
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { debugMessage = "empty"
      , numberPieces = 42

      --   , puzzle =
      --         { piecesX = 18
      --         , piecesY = 13
      --         , gridPerturb = 3
      --         , seed = Random.initialSeed 768
      --         , draftMode = True
      --         }
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = NoOp
    | DragStart
    | DragMove Int Int
    | DragStop Float
    | ClickedMarker


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- DragMove x y ->
        --     ( { model
        --         | debugMessage =
        --             "You moved the mouse to page coordinates "
        --                 ++ String.fromInt x
        --                 ++ ", "
        --                 ++ String.fromInt y
        --       }
        --     , Cmd.none
        --     )
        ClickedMarker ->
            ( { model
                | debugMessage =
                    "clickeeeey"
              }
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Document Msg
view model =
    { title = "puzzleface"
    , body =
        [ Html.text model.debugMessage
        , Html.br [] []
        , draw
        ]
    }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    onMouseMove
        (Decode.map2 DragMove
            (Decode.field "pageX" Decode.int)
            (Decode.field "pageY" Decode.int)
        )



-- THE REST OF THE FUCKING OWL


draw =
    let
        cnvs =
            canvas 800 600

        nPoints =
            100

        pointCoordsx =
            Random.list nPoints (Random.int 0 800)
                |> (\l -> Random.step l (Random.initialSeed 2))
                |> Tuple.first
                |> List.map toFloat

        pointCoordsy =
            Random.list nPoints (Random.int 0 600)
                |> (\l -> Random.step l (Random.initialSeed 2))
                |> Tuple.first
                |> List.map toFloat

        points =
            List.map2 Point2d.unitless pointCoordsx pointCoordsy
                |> Array.fromList

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
    cnvs
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
        , HtmlE.onClick ClickedMarker
        ]
        []



-- CANVAS HELPERS


canvas : Int -> Int -> List (Svg msg) -> Svg msg
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


tile : Int -> Int -> Int -> Svg msg
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
