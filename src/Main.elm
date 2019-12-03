module Main exposing (main)

import List.Extra as List
import Svg exposing (..)
import Svg.Attributes exposing (..)


main =
    let
        cnvs =
            canvas 800 600
    in
    cnvs
        [--     rect
         --     [ x "10"
         --     , y "10"
         --     , width "100"
         --     , height "100"
         --     , rx "15"
         --     , ry "15"
         --     ]
         --     []
         -- , circle
         --     [ cx "50"
         --     , cy "50"
         --     , r "50"
         --     , fill "#eeff00"
         --     ]
         --     []
        ]



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
            List.concatMap
                (\xc -> List.map (tile tileSize xc) (List.range 0 <| ynumtiles - 1))
                (List.range 0 (xnumtiles - 1))

        border =
            rect
                [ x "0", y "0", width wStr, height hStr, stroke "#aaaaaa", strokeWidth "2", fillOpacity "0" ]
                []
    in
    svg
        [ width wStr
        , height hStr
        , viewBox <| "0 0 " ++ wStr ++ " " ++ hStr
        ]
        [ g [] tiles
        , border
        , g [] children
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
    rect
        [ x (String.fromInt (xc * size))
        , y (String.fromInt (yc * size))
        , width (String.fromInt size)
        , height (String.fromInt size)
        , fill col
        ]
        []
