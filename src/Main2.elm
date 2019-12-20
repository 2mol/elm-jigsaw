module Main2 exposing (main)

import List.Extra as List
import Random
import Result
import Svg exposing (..)
import Svg.Attributes exposing (..)


puzzle =
    { piecesX = 18
    , piecesY = 13
    , gridPerturb = 3
    , seed = Random.initialSeed 1
    , draftMode = True
    }


params =
    { width = puzzle.piecesX * 40
    , height = puzzle.piecesY * 40
    }


main : Svg msg
main =
    let
        cnvs =
            canvas params.width params.height

        grid =
            rectangular puzzle.piecesX puzzle.piecesY
                |> perturbGrid puzzle.gridPerturb

        -- randomGrid params.width params.height 400
        -- perturbedRectangular puzzle.piecesX puzzle.piecesY puzzle.gridPerturb
        markers =
            List.map marker grid

        border =
            rect
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
            [ g [] markers ]
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


rectangular : Int -> Int -> List ( Int, Int )
rectangular nx ny =
    let
        pointCoordsx =
            List.range 0 nx
                |> List.map (\n -> n * 40)

        pointCoordsy =
            List.range 0 ny
                |> List.map (\n -> n * 40)
    in
    List.lift2 Tuple.pair pointCoordsx pointCoordsy


perturbGrid : Int -> List ( Int, Int ) -> List ( Int, Int )
perturbGrid pert grid =
    let
        randomPair =
            Random.pair
                (Random.int -pert pert)
                (Random.int -pert pert)

        randomPairListGen =
            Random.list (List.length grid) randomPair

        ( randomPairList, _ ) =
            Random.step randomPairListGen puzzle.seed

        addPair ( cx, cy ) ( px, py ) =
            ( cx + px |> snapToEdges pert params.width
            , cy + py |> snapToEdges pert params.height
            )
    in
    List.map2 addPair randomPairList grid


snapToEdges : Int -> Int -> Int -> Int
snapToEdges howClose maxCoord coord =
    if coord - howClose <= 0 then
        0

    else if coord + howClose >= maxCoord then
        maxCoord

    else
        coord



-- perturbedRectangular : Int -> Int -> Int -> List ( Int, Int )
-- perturbedRectangular nx ny pert =
--     let
--         grid =
--             rectangular nx ny
--         intGen =
--             Random.int -pert pert
--         ( randomCoordList, _ ) =
--             Random.pair intGen intGen
--                 |> Random.list (List.length grid)
--                 |> (\l -> Random.step l puzzle.seed)
--     in
--     List.map2 (\( cx, cy ) ( p1, p2 ) -> ( cx + p1, cy + p2 ))
--         grid
--         randomCoordList
-- randomGrid : Int -> Int -> Int -> List ( Int, Int )
-- randomGrid xmax ymax npoints =
--     Random.pair (Random.int 0 xmax) (Random.int 0 ymax)
--         |> Random.list npoints
--         |> (\l -> Random.step l puzzle.seed)
--         |> Tuple.first
-- SVG HELPERS


marker : ( Int, Int ) -> Svg msg
marker ( xc, yc ) =
    circle
        [ cx <| String.fromInt xc
        , cy <| String.fromInt yc
        , r "2"
        , stroke "#666666"
        , fillOpacity "0"
        ]
        []


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
                [ g [] tiles ]

            else
                []
    in
    svg
        [ width wStr
        , height hStr
        , viewBox <| "0 0 " ++ wStr ++ " " ++ hStr
        ]
        (maybeTiles ++ [ g [] children ])


tile : Int -> Int -> Int -> Svg msg
tile size xc yc =
    let
        col =
            if modBy 2 (xc + yc) == 0 then
                "#eeeeee"

            else
                "#ffffff"
    in
    rect
        [ x (String.fromInt (xc * size))
        , y (String.fromInt (yc * size))
        , width (String.fromInt size)
        , height (String.fromInt size)
        , fill col
        ]
        []
