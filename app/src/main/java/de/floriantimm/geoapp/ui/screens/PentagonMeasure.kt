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
fun PentagonMeasure (modifier: Modifier = Modifier, viewModel: GeoAppViewModel = GeoAppViewModel(), onSave: () -> Unit)  {
    var pointNumber by rememberSaveable { mutableStateOf<String?>(null) }
    var ordinate by rememberSaveable { mutableStateOf<Double?>(null) }
    var abscissa by rememberSaveable { mutableStateOf<Double?>(null) }

    Column(modifier = modifier) {
        PointComboBox (
            label = stringResource(R.string.targetpoint),
            value = pointNumber,
            viewModel = viewModel
        ) {
            pointNumber = it
        }

        NumberTextField(label = stringResource(R.string.ordinate), ordinate, maxValue = 2000.0) {
            ordinate = it
        }
        NumberTextField(label = stringResource(R.string.abscissa), abscissa, maxValue = 2000.0) {
        abscissa = it
    }

        Button(text = stringResource(R.string.save),
            enabled = (pointNumber != null && pointNumber != "" && ordinate != null)) {
            viewModel.addPentagonMeasure(pointNumber!!, ordinate!!, abscissa?:0.0)
            pointNumber = null
            ordinate = null
            abscissa = null
            onSave()
        }



    }
}


@Preview(showBackground = true)
@Composable
fun PentagonMeasurePreview() {
    PentagonMeasure {}
}