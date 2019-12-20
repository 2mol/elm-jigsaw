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
    }


params =
    { width = puzzle.piecesX * 40
    , height = puzzle.piecesY * 40
    }


type alias Point =
    { x : Int
    , y : Int
    }


type alias Edge =
    { start : Point
    , end : Point
    }


main : Svg msg
main =
    let
        cnvs =
            canvas params.width params.height

        grid =
            rectangularGrid puzzle.piecesX puzzle.piecesY
                |> perturbGrid

        -- randomGrid params.width params.height 400
        -- perturbedRectangular puzzle.piecesX puzzle.piecesY puzzle.gridPerturb
        markers =
            Dict.values grid
                |> List.map marker

        edges =
            calcEdges grid

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
            , Svg.g [] <| List.map edge edges
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
            []


rectangularGrid : Int -> Int -> Dict ( Int, Int ) Point
rectangularGrid nx ny =
    let
        indicesX =
            List.range 0 nx

        -- |> List.map (\n -> n * 40)
        indicesY =
            List.range 0 ny

        -- |> List.map (\n -> n * 40)
        indices =
            List.lift2 Tuple.pair indicesX indicesY
    in
    -- List.indexedMap
    --     (\ix cx ->
    --         List.indexedMap (\iy cy -> ( ( ix, iy ), { x = cx, y = cy } ))
    --             pointCoordsy
    --     )
    --     pointCoordsx
    indices
        |> List.map (\( ix, iy ) -> ( ( ix, iy ), { x = ix * 40, y = iy * 40 } ))
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
    -- indices
    --     |> List.map (\( ix, iy ) -> ( ( ix, iy ), { x = ix * 40, y = iy * 40 } ))
    --     |> Dict.fromList
    Dict.values grid
        |> List.map2 (\( rx, ry ) point -> { x = point.x + rx, y = point.y + ry }) randomPairList
        |> List.map snapToBorder
        |> List.map2 Tuple.pair (Dict.keys grid)
        |> Dict.fromList



-- perturbGrid : List (List ( Int, Int )) -> List (List ( Int, Int ))
-- perturbGrid grid =
--     let
--         pert =
--             puzzle.gridPerturb
--         randomPair =
--             Random.pair
--                 (Random.int -pert pert)
--                 (Random.int -pert pert)
--         randomPairListGen =
--             Random.list (List.length grid) randomPair
--         ( randomPairList, _ ) =
--             Random.step randomPairListGen puzzle.seed
--         addPair ( cx, cy ) ( px, py ) =
--             ( cx + px |> snapToEdges pert params.width
--             , cy + py |> snapToEdges pert params.height
--             )
--         subListMap coords =
--             Random.list (List.length grid) randomPair
--                 |> (\gen -> Random.step gen puzzle.seed)
--     in
--     List.map
--         (\coords -> List.map2 addPair randomPairList coords)
--         grid
-- perturbCoord : ( Int, Int ) -> Random.Seed -> ( ( Int, Int ), Random.Seed )
-- perturbCoord ( cx, cy ) seed =
--     let
--         pert =
--             puzzle.gridPerturb
--         pairGen =
--             Random.pair
--                 (Random.int -pert pert)
--                 (Random.int -pert pert)
--     in
--     Random.step pairGen seed


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
    -- let
    --     pointIndicesX =
    --         List.range 0 (List.length grid)
    --     pointIndicesY =
    --         List.range 0 (List.length col)
    --             |> List.map (\n -> n * 40)
    --     -- tryConnect xIndex yIndex=
    -- in
    -- List.map
    --     (\xIndex ->
    --         List.map (\yIndex -> { x = cx, y = cy })
    --             pointIndicesY
    --     )
    --     pointIndicesX
    let
        maybeConnect indices point =
            Dict.get indices grid
                |> Maybe.map (\point2 -> { start = point, end = point2 })

        maybeConnect2 ( ix, iy ) point =
            [ maybeConnect ( ix + 1, iy ) point
            , maybeConnect ( ix, iy + 1 ) point
            ]
    in
    grid
        |> Dict.map maybeConnect2
        |> Dict.values
        |> List.concatMap identity
        |> List.filterMap identity


tryConnect : List (List Point) -> Int -> Int -> Maybe Edge
tryConnect grid xIndex yIndex =
    case List.getAt xIndex grid of
        Just yCol ->
            case List.getAt yIndex grid of
                Just point ->
                    Nothing

                _ ->
                    Nothing

        _ ->
            Nothing



-- SVG HELPERS


marker : Point -> Svg msg
marker { x, y } =
    Svg.circle
        [ cx <| String.fromInt x
        , cy <| String.fromInt y
        , r "2"
        , stroke "#666"
        , fillOpacity "0"
        ]
        []


edge : Edge -> Svg msg
edge { start, end } =
    Svg.line
        [ x1 <| String.fromInt start.x
        , y1 <| String.fromInt start.y
        , x2 <| String.fromInt end.x
        , y2 <| String.fromInt end.y
        , strokeWidth "1"
        , stroke "#666"
        ]
        []



-- CANVAS


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
