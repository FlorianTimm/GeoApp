package de.floriantimm.geoapp.ui

import de.floriantimm.geoapp.data.DataStorage
import de.floriantimm.geoapp.data.Point

class GeoAppViewModel {
    private val data = DataStorage()
    private var station: Point? = null
    private var instrumentHeight = 1.6

    fun getPoints (): List<String> {
        return data.getPoints().map { it.name }
    }

    fun addMeasure (pointNumber: String,horizontalAngle: Double? = null,zenithAngle: Double? = null,distance: Double? = null) {
        val point: Point = data.getPoint(pointNumber)
        if (this.station == null) {
            return
        }
        data.addMeasurement(this.station!!, point, horizontalAngle, zenithAngle, distance)
    }

    fun stationed(): Boolean {
        return this.station != null
    }

    fun newStation (pointNumber: String, instrumentHeight: Double) {
        val point: Point = data.getPoint(pointNumber)
        this.station = point
        this.instrumentHeight = instrumentHeight
    }


}