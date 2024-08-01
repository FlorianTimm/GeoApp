package de.floriantimm.geoapp.data

class PointLocation internal constructor(var x: Double?, var y: Double?, var z: Double?, epsg: String?) {
    var epsg : String? = null
            set(value) {
                field = if (value?.isNotEmpty() == true && value.startsWith("EPSG:")) {
                    value
                } else {
                    null
                }
            }

    override fun toString(): String {
        return "($x, $y, $z)"
    }

}