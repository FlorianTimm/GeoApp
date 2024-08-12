package de.floriantimm.geoapp.data

open class TheodoliteMeasure ( setup: TheodoliteSetup,
                               to: Point,
                               horizontalDirection: Double?=null,
                               verticalAngle: Double?=null,
                               distance: Double?=null )


class TheodoliteSetup (var point: Point,
                       name : String? = null,
                       instrumentHeight: Double = 0.0,
                       orientation: Double? = null)