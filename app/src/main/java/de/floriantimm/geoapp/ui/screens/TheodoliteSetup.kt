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
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun TheodoliteSetup(modifier: Modifier = Modifier, viewModel: GeoAppViewModel = GeoAppViewModel(), onSave: () -> Unit) {
    Column(modifier = modifier) {
        var pointNumber by rememberSaveable { mutableStateOf<String?>(null) }
        var instrumentHeight by rememberSaveable { mutableStateOf<Double?>(1.6) }

        PointComboBox(value = pointNumber,
            viewModel = viewModel) {
         pointNumber = it
        }
        NumberTextField(label = stringResource(R.string.instrumentheight), instrumentHeight, maxValue = 4.0) {
            instrumentHeight = it
        }
        Button(text = stringResource(R.string.save),
            enabled = (pointNumber != null && pointNumber != "")) {
            if (pointNumber != null && pointNumber != "") {
                viewModel.newStation(pointNumber!!, instrumentHeight!!)
                pointNumber = null
                instrumentHeight = 1.6
                onSave()
            }

            
        }
    }
}

@Preview(showBackground = true)
@Composable
fun TheodoliteSetupPreview() {
    GeoAppTheme {
        TheodoliteSetup {   }
        }
}