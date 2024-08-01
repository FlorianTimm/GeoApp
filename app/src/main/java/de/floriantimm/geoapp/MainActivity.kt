package de.floriantimm.geoapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.ExperimentalMaterial3Api
import de.floriantimm.geoapp.ui.GeoAppViewModel
import de.floriantimm.geoapp.ui.screens.Startpage
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val viewModel = GeoAppViewModel()
        enableEdgeToEdge()
        setContent {
            GeoAppTheme {
                Startpage(viewModel)
            }
        }
    }
}
