module Main2 exposing (main)

import Dict exposing (Dict)
import List.Extra as List
import Random
import Result
import Svg exposing (Svg)
import Svg.Attributes exposing (..)


puzzle =
    { piecesX = 18
    , piecesY = 13
    , gridPerturb = 4
    , seed = Random.initialSeed 1
    , draftMode = True
    , pixelsPerCell = 50
    }


params =
    { width = puzzle.piecesX * puzzle.pixelsPerCell
    , height = puzzle.piecesY * puzzle.pixelsPerCell
    }


type alias Point =
    { x : Int
    , y : Int
    }


type alias Edge =
    { start : Point
    , end : Point
    }


type alias Curve3 =
    { start : Point
    , startControl : Point
    , middle : Point
    , middleControl : Point
    , endControl : Point
    , end : Point
    }


testCurve : Curve3
testCurve =
    --"M 10 80 C 40 10, 65 10, 95 80 S 150 50, 180 80"
    { start = Point 10 80
    , startControl = Point 40 10
    , middleControl = Point 65 10
    , middle = Point 95 80
    , endControl = Point 150 50
    , end = Point 180 80
    }


basicTongue : Curve3
basicTongue =
    --"M 10 80 C 40 10, 65 10, 95 80 S 150 50, 180 80"
    { start = Point 0 0
    , startControl = Point 70 0
    , middleControl = Point 10 30
    , middle = Point 50 30
    , endControl = Point 30 0
    , end = Point 100 0
    }


drawCurve3 : Curve3 -> Svg msg
drawCurve3 curve =
    let
        pieces =
            [ "M "
                ++ String.fromInt curve.start.x
                ++ " "
                ++ String.fromInt curve.start.y
            , "C "
                ++ String.fromInt curve.startControl.x
                ++ " "
                ++ String.fromInt curve.startControl.y
                ++ ", "
                ++ String.fromInt curve.middleControl.x
                ++ " "
                ++ String.fromInt curve.middleControl.y
                ++ ", "
                ++ String.fromInt curve.middle.x
                ++ " "
                ++ String.fromInt curve.middle.y
            , "S "
                ++ String.fromInt curve.endControl.x
                ++ " "
                ++ String.fromInt curve.endControl.y
                ++ ", "
                ++ String.fromInt curve.end.x
                ++ " "
                ++ String.fromInt curve.end.y
            ]
    in
    Svg.path
        [ stroke "black"
        , fill "transparent"

        -- , d "M 10 80 C 40 10, 65 10, 95 80 S 150 50, 180 80"
        , d <| String.join "" pieces
        ]
        []


main : Svg msg
main =
    let
        cnvs =
            canvas params.width params.height

        grid =
            rectangularGrid puzzle.piecesX puzzle.piecesY
                |> perturbGrid

        markers =
            Dict.values grid
                |> List.map drawMarker

        isOnBorder edge =
            False
                || (edge.start.x == 0 && edge.end.x == 0)
                || (edge.start.y == 0 && edge.end.y == 0)
                || (edge.start.x == params.width && edge.end.x == params.width)
                || (edge.start.y == params.height && edge.end.y == params.height)

        edges =
            calcEdges grid
                |> List.filter (not << isOnBorder)

        border =
            Svg.rect
                [ x "0"
                , y "0"
                , width (String.fromInt params.width)
                , height (String.fromInt params.height)
                , fillOpacity "0"
                , stroke "black"
                ]
                []
    in
    cnvs <|
        if puzzle.draftMode then
            [ Svg.g [] markers

            -- , edge
            --     { start = { x = 0, y = 0 }
            --     , end = { x = 100, y = 100 }
            --     }
            , Svg.g [] <| List.map drawEdge edges
            , drawCurve3 basicTongue
            , border
            ]
            -- [ g [] tongues
            -- , g [] (drawingShort "red")
            -- , g [] markers
            -- , g [] drawingLong
            -- ]

        else
            -- [ g [] tongues
            -- , g [] (drawingShort "black")
            -- , border
            -- ]
            [ border ]


rectangularGrid : Int -> Int -> Dict ( Int, Int ) Point
rectangularGrid nx ny =
    let
        indicesX =
            List.range 0 nx

        indicesY =
            List.range 0 ny

        indices =
            List.lift2 Tuple.pair indicesX indicesY
    in
    indices
        |> List.map
            (\( ix, iy ) ->
                ( ( ix, iy )
                , { x = ix * puzzle.pixelsPerCell
                  , y = iy * puzzle.pixelsPerCell
                  }
                )
            )
        |> Dict.fromList


perturbGrid : Dict ( Int, Int ) Point -> Dict ( Int, Int ) Point
perturbGrid grid =
    let
        pert =
            puzzle.gridPerturb

        randomPair =
            Random.pair
                (Random.int -pert pert)
                (Random.int -pert pert)

        randomPairListGen =
            Random.list (Dict.size grid) randomPair

        ( randomPairList, _ ) =
            Random.step randomPairListGen puzzle.seed
    in
    Dict.values grid
        |> List.map2 (\( rx, ry ) point -> { x = point.x + rx, y = point.y + ry }) randomPairList
        -- optional: keep borders straight
        |> List.map snapToBorder
        |> List.map2 Tuple.pair (Dict.keys grid)
        |> Dict.fromList


snapToBorder : Point -> Point
snapToBorder { x, y } =
    { x = snapToBorder_ puzzle.gridPerturb params.width x
    , y = snapToBorder_ puzzle.gridPerturb params.height y
    }


snapToBorder_ : Int -> Int -> Int -> Int
snapToBorder_ howClose maxCoord coord =
    if coord - howClose <= 0 then
        0

    else if coord + howClose >= maxCoord then
        maxCoord

    else
        coord


calcEdges : Dict ( Int, Int ) Point -> List Edge
calcEdges grid =
    let
        maybeConnect indices point =
            Dict.get indices grid
                |> Maybe.map (\point2 -> { start = point, end = point2 })

        -- maybeConnect2 ( ix, iy ) point =
        --     maybeConnect ( ix + 1, iy ) point
        -- , maybeConnect ( ix, iy + 1 ) point
        horizontals =
            grid
                |> Dict.map (\( ix, iy ) -> maybeConnect ( ix + 1, iy ))
                |> Dict.values
                |> List.filterMap identity

        verticals =
            grid
                |> Dict.map (\( ix, iy ) -> maybeConnect ( ix, iy + 1 ))
                |> Dict.values
                |> List.filterMap identity
    in
    horizontals ++ verticals



-- SVG DRAWING FUNCTIONS


drawMarker : Point -> Svg msg
drawMarker { x, y } =
    Svg.circle
        [ cx <| String.fromInt x
        , cy <| String.fromInt y
        , r "2"
        , stroke "#666"
        , fillOpacity "0"
        ]
        []


drawEdge : Edge -> Svg msg
drawEdge { start, end } =
    Svg.line
        [ x1 <| String.fromInt start.x
        , y1 <| String.fromInt start.y
        , x2 <| String.fromInt end.x
        , y2 <| String.fromInt end.y
        , strokeWidth "1"
        , stroke "#c66"
        ]
        []



-- SVG CANVAS HELPERS


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

        -- border =
        --     rect
        --         [ x "0", y "0", width wStr, height hStr, fillOpacity "0" ]
        --         []
        maybeTiles =
            if puzzle.draftMode then
                [ Svg.g [] tiles ]

            else
                []
    in
    Svg.svg
        [ width wStr
        , height hStr
        , viewBox <| "0 0 " ++ wStr ++ " " ++ hStr
        ]
        (maybeTiles ++ [ Svg.g [] children ])


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
        [ x (String.fromInt (xc * size))
        , y (String.fromInt (yc * size))
        , width (String.fromInt size)
        , height (String.fromInt size)
        , fill col
        ]
        []
