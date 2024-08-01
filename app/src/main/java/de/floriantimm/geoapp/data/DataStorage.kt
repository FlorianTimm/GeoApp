package de.floriantimm.geoapp.data

class DataStorage {
    private val points: MutableList<Point> = mutableListOf()
    private val measurements: MutableList<Measure> = mutableListOf()

    fun getPoints(): List<Point> {
        return points
    }

    fun getPoint(name: String): Point {
        var point = points.find { it.name == name }
        if (point == null) {
            point = createPoint(name)
        }
        return point
    }

    private fun createPoint(name: String): Point {
        val point = Point(name)
        points.add(point)
        return point
    }

    fun addMeasurement(from: Point,
                       to: Point,
                       horizontalDirection: Double? = null,
                       zenithAngle: Double? = null,
                       distance: Double? = null) {

        val measurement = Measure(from, to, horizontalDirection, zenithAngle, distance)
        measurements.add(measurement)
    }

}