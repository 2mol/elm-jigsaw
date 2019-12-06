module Main exposing (main)

import Angle
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
import Vector2d
import VoronoiDiagram2d


params =
    { width = 1000
    , height = 800
    }


main : Svg msg
main =
    let
        cnvs =
            canvas params.width params.height

        pointCoords =
            -- randomGrid params.width params.height 400
            perturbedRectangular 24 19 3

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
                    (BoundingBox2d.from
                        (Point2d.unitless 0 0)
                        (Point2d.unitless params.width params.height)
                    )
                |> List.map Tuple.second

        lineCoord : LineSegment2d Unitless coordinates -> ( Int, Int )
        lineCoord lineSegment =
            -- a little "trick" to compare edges for equality
            -- independent of orientation: just compare their midpoint
            LineSegment2d.midpoint lineSegment
                |> Point2d.toUnitless
                |> (\{ x, y } -> ( round x, round y ))

        edges =
            List.concatMap Polygon2d.edges polygons
                |> List.uniqueBy lineCoord

        edgesLong =
            List.filter (\l -> Quantity.toFloat (LineSegment2d.length l) >= 20) edges

        edgesShort =
            List.filter (\l -> Quantity.toFloat (LineSegment2d.length l) < 20) edges

        drawingLong =
            List.map
                (Geometry.Svg.lineSegment2d [ stroke "#999", strokeDasharray "2", fillOpacity "0" ])
                edgesLong

        drawingShort =
            List.map
                (Geometry.Svg.lineSegment2d [ stroke "black", fillOpacity "0" ])
                edgesShort

        edgesLongInner =
            List.filter (not << isOnBorder) edgesLong

        -- wigglyDrawing =
        --     drawWiggly baseWiggly
        ( flips, _ ) =
            Random.uniform True [ True, False ]
                |> Random.list (List.length edgesLongInner)
                |> (\l -> Random.step l (Random.initialSeed 667))

        tongues =
            edgesLongInner
                |> List.map2 flip flips
                |> List.map (fitWiggly baseWiggly)
                |> List.map drawWiggly

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
    cnvs
        [ g [] markers

        --   g [] drawingLong
        , g [] drawingShort

        -- , wigglyDrawing
        , g [] tongues
        , border
        ]


isOnBorder edge =
    let
        { x, y } =
            LineSegment2d.midpoint edge
                |> Point2d.toUnitless

        ( mx, my ) =
            ( round x, round y )
    in
    mx == 0 || my == 0 || mx == params.width || my == params.height



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
                |> (\l -> Random.step l (Random.initialSeed 668))
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


flip : Bool -> LineSegment2d Unitless () -> LineSegment2d Unitless ()
flip flag segment =
    if flag then
        segment

    else
        let
            pivot =
                LineSegment2d.midpoint segment

            angle =
                Angle.degrees 180
        in
        LineSegment2d.rotateAround pivot angle segment


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
                [ x "0", y "0", width wStr, height hStr, fillOpacity "0" ]
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
