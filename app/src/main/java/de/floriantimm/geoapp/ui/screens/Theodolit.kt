package de.floriantimm.geoapp.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import de.floriantimm.geoapp.R
import de.floriantimm.geoapp.ui.GeoAppViewModel
import de.floriantimm.geoapp.ui.elements.Button
import de.floriantimm.geoapp.ui.elements.ComboBox
import de.floriantimm.geoapp.ui.elements.HeadlineMedium
import de.floriantimm.geoapp.ui.elements.NumberTextField
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun Theodolit(
    modifier: Modifier = Modifier,
    viewModel: GeoAppViewModel,
) {
    Surface(modifier = modifier) {
        Column {
            var pointNumber by rememberSaveable { mutableStateOf<String?>(null) }
            var horizontalAngle by rememberSaveable { mutableStateOf<Double?>(null) }
            var zenithAngle by rememberSaveable { mutableStateOf<Double?>(null) }
            var distance by rememberSaveable { mutableStateOf<Double?>(null) }

            HeadlineMedium(stringResource(R.string.lage) + " I")
            ComboBox(
                label = stringResource(R.string.punktnummer),
                liste = viewModel.getPoints(),
                pointNumber
            ) {
                pointNumber = it
            }
            NumberTextField(stringResource(R.string.horizontalrichtung), horizontalAngle) {
                horizontalAngle = it
            }
            NumberTextField(stringResource(R.string.zenitwinkel), zenithAngle) {
                zenithAngle = it
            }
            NumberTextField(stringResource(R.string.strecke), distance) {
                distance = it
            }
            Button(
                stringResource(R.string.speichern),
                enabled = (pointNumber != null && pointNumber != "" &&
                        (horizontalAngle != null || zenithAngle != null || distance != null))
            ) {
                viewModel.addMeasure(pointNumber, horizontalAngle, zenithAngle, distance)
                pointNumber = null
                horizontalAngle = null
                zenithAngle = null
                distance = null
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun TheodolitPreview() {
    GeoAppTheme {
        Theodolit(viewModel = GeoAppViewModel())
    }
}