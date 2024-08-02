package de.floriantimm.geoapp.data

class Point internal constructor(var name: String) {
    private var pointLocations: MutableList<PointLocation> = mutableListOf()

    override fun toString(): String {
        return name
    }

    fun addLocation(location: PointLocation) {
        pointLocations.add(location)
    }
}