package de.floriantimm.geoapp.ui

import de.floriantimm.geoapp.data.DataStorage
import de.floriantimm.geoapp.data.Point
import de.floriantimm.geoapp.data.TheodoliteSetup

class GeoAppViewModel {
    private val data = DataStorage()
    private var theodoliteSetup: TheodoliteSetup? = null
    private var startPoint: Point? = null
    private var endPoint: Point? = null

    fun getPoints (): List<String> {
        return data.getPoints().map { it.name }
    }

    fun addMeasure (pointNumber: String,horizontalAngle: Double? = null,zenithAngle: Double? = null,distance: Double? = null) {
        val point: Point = data.getPoint(pointNumber)
        if (this.theodoliteSetup == null) {
            return
        }
        data.addMeasurement(this.theodoliteSetup!!, point, horizontalAngle, zenithAngle, distance)
    }

    fun stationed(): Boolean {
        return this.theodoliteSetup != null
    }

    fun newStation (pointNumber: String, instrumentHeight: Double) {
        val point: Point = data.getPoint(pointNumber)
        this.theodoliteSetup = TheodoliteSetup(point, instrumentHeight = instrumentHeight)
    }

    fun getStation(): String {
        return theodoliteSetup!!.point.name
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