module Main exposing (main)

import Array
import Axis2d
import BoundingBox2d
import CubicSpline2d exposing (CubicSpline2d)
import Direction2d
import Geometry.Svg
import LineSegment2d exposing (LineSegment2d)
import List.Extra as List
import Point2d
import Polygon2d
import Quantity exposing (Unitless)
import Random
import Result
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Vector2d exposing (Vector2d)
import VoronoiDiagram2d


main =
    let
        cnvs =
            canvas 1000 800

        pointCoords =
            -- randomGrid 1000 800 400
            perturbedRectangular 24 19 4

        markers =
            List.map marker pointCoords

        coordToPoint ( xc, yc ) =
            Point2d.unitless (toFloat xc) (toFloat yc)

        voronoi =
            Array.fromList pointCoords
                |> Array.map coordToPoint
                |> VoronoiDiagram2d.fromPoints
                |> Result.withDefault VoronoiDiagram2d.empty

        polygons =
            voronoi
                |> VoronoiDiagram2d.polygons
                    (BoundingBox2d.from (Point2d.unitless 0 0) (Point2d.unitless 1000 800))
                |> List.map Tuple.second

        lineCoord : LineSegment2d Unitless coordinates -> ( ( Int, Int ), ( Int, Int ) )
        lineCoord lineSegment =
            LineSegment2d.endpoints lineSegment
                |> Tuple.mapBoth Point2d.toUnitless Point2d.toUnitless
                |> (\( c1, c2 ) -> ( ( round c1.x, round c1.y ), ( round c2.x, round c2.y ) ))

        edges =
            List.concatMap Polygon2d.edges polygons
                |> List.uniqueBy lineCoord

        edgesL =
            List.filter (\l -> Quantity.toFloat (LineSegment2d.length l) >= 20) edges

        edgesS =
            List.filter (\l -> Quantity.toFloat (LineSegment2d.length l) < 20) edges

        drawingL =
            List.map
                (Geometry.Svg.lineSegment2d [ stroke "#999", strokeDasharray "2", fillOpacity "0" ])
                edgesL

        drawingS =
            List.map
                (Geometry.Svg.lineSegment2d [ stroke "red", fillOpacity "0" ])
                edgesS

        wigglyDrawing =
            drawWiggly baseWiggly

        tongues =
            List.map (fitWiggly baseWiggly >> drawWiggly) edgesL
    in
    cnvs
        [ g [] markers
        , g [] drawingL
        , g [] drawingS
        , wigglyDrawing
        , g [] tongues
        ]



-- GRID GENERATION HELPERS


rectangular : Int -> Int -> List ( Int, Int )
rectangular nx ny =
    let
        pointCoordsx =
            List.range 0 nx
                |> List.map (\n -> n * 40 + 20)

        pointCoordsy =
            List.range 0 ny
                |> List.map (\n -> n * 40 + 20)
    in
    List.lift2 Tuple.pair pointCoordsx pointCoordsy


perturbedRectangular : Int -> Int -> Int -> List ( Int, Int )
perturbedRectangular nx ny pert =
    let
        grid =
            rectangular nx ny

        intGen =
            Random.int -pert pert

        ( randomCoordList, _ ) =
            Random.pair intGen intGen
                |> Random.list (List.length grid)
                |> (\l -> Random.step l (Random.initialSeed 666))
    in
    List.map2 (\( cx, cy ) ( p1, p2 ) -> ( cx + p1, cy + p2 ))
        grid
        randomCoordList


randomGrid : Int -> Int -> Int -> List ( Int, Int )
randomGrid xmax ymax npoints =
    Random.pair (Random.int 0 xmax) (Random.int 0 ymax)
        |> Random.list npoints
        |> (\l -> Random.step l (Random.initialSeed 3))
        |> Tuple.first



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



-- interlocker : LineSegment2d Unitless coordinates -> CubicSpline2d Unitless coordinates
-- interlocker segment =
--     let
--         ( p1, p2 ) =
--             LineSegment2d.endpoints segment
--     in
--     wiggly


type alias Wiggly =
    ( CubicSpline2d Unitless (), CubicSpline2d Unitless () )


baseWiggly : Wiggly
baseWiggly =
    let
        baseShape =
            CubicSpline2d.fromControlPoints
                -- startpoint
                (Point2d.unitless 50 120)
                (Point2d.unitless 200 120)
                (Point2d.unitless 50 50)
                -- endpoint
                (Point2d.unitless 150 50)

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


drawWiggly : Wiggly -> Svg msg
drawWiggly ( w1, w2 ) =
    let
        drawHalf spline =
            Geometry.Svg.cubicSpline2d [ stroke "black", fillOpacity "0" ] spline
    in
    g [] [ drawHalf w1, drawHalf w2 ]



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
            rect
                [ x "0"
                , y "0"
                , width wStr
                , height hStr

                -- , stroke "red"
                -- , strokeWidth "2"
                , fillOpacity "0"
                ]
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
