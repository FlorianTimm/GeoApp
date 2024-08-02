package de.floriantimm.geoapp.ui

import de.floriantimm.geoapp.data.DataStorage
import de.floriantimm.geoapp.data.Point

class GeoAppViewModel {
    private val data = DataStorage()
    private var station: Point? = null
    private var instrumentHeight = 1.6
    private var startPoint: Point? = null
    private var endPoint: Point? = null

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

    fun getStation(): String {
        return station!!.name
    }

    fun measureLineExists():Boolean {
        return startPoint != null && endPoint != null
    }

    fun setMeasureLine (startPoint: String, endPoint: String, distance: Double) {
        this.startPoint = data.getPoint(startPoint)
        this.endPoint = data.getPoint(endPoint)
    }

    fun addPentagonMeasure (pointNumber: String, ordinate: Double, abscissa: Double) {
        val point: Point = data.getPoint(pointNumber)

    }



}