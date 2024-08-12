package de.floriantimm.geoapp.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import de.floriantimm.geoapp.ui.screens.GnssScreen
import de.floriantimm.geoapp.ui.screens.PentagonSetupView
import de.floriantimm.geoapp.ui.screens.Homepage
import de.floriantimm.geoapp.ui.screens.PentagonMeasureView
import de.floriantimm.geoapp.ui.screens.TheodoliteMeasurementView
import de.floriantimm.geoapp.ui.screens.TheodoliteSetupView
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun Navigation (viewModel: GeoAppViewModel = GeoAppViewModel()) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "Homepage") {
        composable("Homepage") {
            Homepage(viewModel = viewModel,
                onTheodolite = { navController.navigate("theodolite") },
                onPentagonPrism = { navController.navigate("pentagon") },
                onGnss = { navController.navigate("gnss") }
            )
        }

        composable("gnss") {
            GnssScreen()
        }

        composable("theodolite") {
            if (viewModel.stationed()) {
               navController.navigate("theodoliteMeasure") {
                   popUpTo("Homepage")
               }
            } else {
                navController.navigate("theodoliteSetup") {
                    popUpTo("Homepage")
                }

            }
        }

        composable("theodoliteMeasure") {
            TheodoliteMeasurementView(viewModel = viewModel)
        }


        composable("theodoliteSetup") {
            TheodoliteSetupView(viewModel = viewModel) {
                navController.navigate("theodoliteMeasure") {
                    popUpTo("Homepage")
                }
            }
        }


        composable("pentagonSetup") {
            PentagonSetupView(viewModel = viewModel) {
                navController.navigate("pentagonMeasure") {
                    popUpTo("Homepage")
                }
            }
        }

        composable("pentagonMeasure") {
            PentagonMeasureView(viewModel = viewModel) {}
        }

        composable("pentagon") {
            if (viewModel.measureLineExists()) {
                navController.navigate("pentagonMeasure") {
                    popUpTo("Homepage")
                }
            } else {
                navController.navigate("pentagonSetup") {
                    popUpTo("Homepage")
                }
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