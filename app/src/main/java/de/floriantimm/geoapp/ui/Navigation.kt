package de.floriantimm.geoapp.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import de.floriantimm.geoapp.ui.screens.Startpage
import de.floriantimm.geoapp.ui.screens.Station
import de.floriantimm.geoapp.ui.screens.Theodolite
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun Navigation (viewModel: GeoAppViewModel = GeoAppViewModel()) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "startpage") {
        composable("startpage") {
            Startpage(viewModel,
                onTheodolite = { navController.navigate("theodolite") },
                onStation = { navController.navigate("station") }
            )
        }
        composable("theodolite") {
            Theodolite(viewModel = viewModel)
        }
        composable("station") {
            Station(viewModel = viewModel) {
                navController.navigate("theodolite")

            }
            }

    }
}

@Preview(showBackground = true)
@Composable
fun NavigationPreview() {
    GeoAppTheme {
        Navigation()
    }
}