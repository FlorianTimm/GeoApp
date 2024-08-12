package de.floriantimm.geoapp.ui.screens

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext

@Composable
fun GnssScreen() {
    val context = LocalContext.current
    var lat by rememberSaveable { mutableStateOf<Double?>(null) }
    var lon by rememberSaveable { mutableStateOf<Double?>(null) }

    gnss(context) { latNew, lonNew ->
        // Handle the location data here
        lat = latNew
        lon = lonNew
    }

    Text("Latitude: $lat, Longitude: $lon")

}