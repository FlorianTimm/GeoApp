package de.floriantimm.geoapp.ui

class GeoAppViewModel {
    private val points = mutableListOf("A100", "B200", "C300")


    fun getPoints (): List<String> {
        return points
    }

    fun addMeasure (pointNumber: String? = null,horizontalAngle: Double? = null,zenithAngle: Double? = null,distance: Double? = null) {
        if (pointNumber != null && pointNumber != "" && pointNumber !in points) {
            points.add(pointNumber)
        }
    }


}