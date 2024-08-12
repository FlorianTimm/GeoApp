package de.floriantimm.geoapp.ui.screens

import androidx.compose.foundation.layout.Column
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
import de.floriantimm.geoapp.ui.elements.NumberTextField
import de.floriantimm.geoapp.ui.elements.PointComboBox


@Composable
fun PentagonSetupView (modifier: Modifier = Modifier, viewModel: GeoAppViewModel = GeoAppViewModel(), onSave: () -> Unit)  {
    var startPoint by rememberSaveable { mutableStateOf<String?>(null) }
    var endPoint by rememberSaveable { mutableStateOf<String?>(null) }
    var distance by rememberSaveable { mutableStateOf<Double?>(null) }

    Column(modifier = modifier) {
        PointComboBox (
            label = stringResource(R.string.startpoint),
            value = startPoint,
            viewModel = viewModel
        ) {
            startPoint = it
        }
        PointComboBox (
            label = stringResource(R.string.endpoint),
            value = endPoint,
            viewModel = viewModel
        ) {
            endPoint = it
        }
        NumberTextField(label = stringResource(R.string.distance), distance, maxValue = 2000.0) {
                distance = it
        }

        Button(text = stringResource(R.string.save),
            enabled = (startPoint != null && startPoint != "" && endPoint != null && endPoint != "" && endPoint != startPoint)) {
            viewModel.setMeasureLine(startPoint!!, endPoint!!, distance!!)
            onSave()
        }



        }
    }


@Preview(showBackground = true)
@Composable
fun PentagonPrismPreview() {
    PentagonSetupView{}
}