package de.floriantimm.geoapp.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import de.floriantimm.geoapp.R
import de.floriantimm.geoapp.ui.GeoAppViewModel
import de.floriantimm.geoapp.ui.elements.Button
import de.floriantimm.geoapp.ui.theme.GeoAppTheme


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Startpage(viewModel: GeoAppViewModel, modifier: Modifier = Modifier, onTheodolite: () -> Unit, onStation: () -> Unit) {
    Column(modifier = modifier.fillMaxSize()) {
        Button(text = stringResource(R.string.theodolit),
            enabled = viewModel.stationed()) {
            onTheodolite()
        }
        Button(text = stringResource( R.string.station)) {
            onStation()
        }
        
    }
}


@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    GeoAppTheme {
        Startpage(GeoAppViewModel(), onTheodolite = {}, onStation = {})
    }
}