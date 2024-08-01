package de.floriantimm.geoapp.ui

import de.floriantimm.geoapp.data.DataStorage
import de.floriantimm.geoapp.data.Point

class GeoAppViewModel {
    private val data = DataStorage()
    private var station = data.getPoint("Station")

    fun getPoints (): List<String> {
        return data.getPoints().map { it.name }
    }

    fun addMeasure (pointNumber: String,horizontalAngle: Double? = null,zenithAngle: Double? = null,distance: Double? = null) {
        val point: Point = data.getPoint(pointNumber)
        data.addMeasurement(station, point, horizontalAngle, zenithAngle, distance)

    }


}