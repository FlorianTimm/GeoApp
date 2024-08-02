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
import de.floriantimm.geoapp.ui.elements.HeadlineMedium
import de.floriantimm.geoapp.ui.elements.NumberTextField
import de.floriantimm.geoapp.ui.elements.PointComboBox
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun TheodoliteMeasurement(
    modifier: Modifier = Modifier,
    viewModel: GeoAppViewModel,
) {
    Surface(modifier = modifier) {
        Column {
            var pointNumber by rememberSaveable { mutableStateOf<String?>(null) }
            var horizontalAngle by rememberSaveable { mutableStateOf<Double?>(null) }
            var zenithAngle by rememberSaveable { mutableStateOf<Double?>(null) }
            var distance by rememberSaveable { mutableStateOf<Double?>(null) }

            HeadlineMedium(stringResource(R.string.position) + " I")
            PointComboBox (
                value = pointNumber,
                viewModel = viewModel
            ) {
                pointNumber = it
            }
            NumberTextField(stringResource(R.string.horizontaldirection), horizontalAngle, maxValue = 400.0) {
                horizontalAngle = it
            }
            NumberTextField(stringResource(R.string.zenithangle), zenithAngle, maxValue = 400.0) {
                zenithAngle = it
            }
            NumberTextField(stringResource(R.string.distance), distance) {
                distance = it
            }
            Button(
                stringResource(R.string.save),
                enabled = (pointNumber != null && pointNumber != "" &&
                        (horizontalAngle != null || zenithAngle != null || distance != null))
            ) {
                if (pointNumber != null && pointNumber != "" && pointNumber != viewModel.getStation() &&
                    (horizontalAngle != null || zenithAngle != null || distance != null)) {
                    viewModel.addMeasure(pointNumber!!, horizontalAngle, zenithAngle, distance)
                    pointNumber = null
                    horizontalAngle = null
                    zenithAngle = null
                    distance = null
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun TheodoliteMeasurementPreview() {
    GeoAppTheme {
        TheodoliteMeasurement(viewModel = GeoAppViewModel())
    }
}