package de.floriantimm.geoapp.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import de.floriantimm.geoapp.ui.screens.PentagonMeasure
import de.floriantimm.geoapp.ui.screens.PentagonSetup
import de.floriantimm.geoapp.ui.screens.Homepage
import de.floriantimm.geoapp.ui.screens.TheodoliteMeasurement
import de.floriantimm.geoapp.ui.screens.TheodoliteSetup
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun Navigation (viewModel: GeoAppViewModel = GeoAppViewModel()) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "Homepage") {
        composable("Homepage") {
            Homepage(viewModel = viewModel,
                onTheodolite = { navController.navigate("theodolite") },
                onPentagonPrism = { navController.navigate("pentagon") }
            )
        }

        composable("theodolite") {
            if (viewModel.stationed()) {
               navController.navigate("theodoliteMeasure")
            } else {
                navController.navigate("theodoliteSetup")

            }
        }

        composable("theodoliteMeasure") {
            TheodoliteMeasurement(viewModel = viewModel)
        }


        composable("theodoliteSetup") {
            TheodoliteSetup(viewModel = viewModel) {
                navController.navigate("theodoliteMeasure") {
                    popUpTo("Homepage")
                }
            }
        }


        composable("pentagonSetup") {
            PentagonSetup(viewModel = viewModel) {
                navController.navigate("pentagonMeasure") {
                    popUpTo("Homepage")
                }
            }
        }

        composable("pentagonMeasure") {
            PentagonMeasure(viewModel = viewModel) {}
        }

        composable("pentagon") {
            if (viewModel.measureLineExists()) {
                navController.navigate("pentagonMeasure")
            } else {
                navController.navigate("pentagonSetup")
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