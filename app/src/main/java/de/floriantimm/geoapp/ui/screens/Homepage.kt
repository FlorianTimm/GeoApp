package de.floriantimm.geoapp.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import de.floriantimm.geoapp.R
import de.floriantimm.geoapp.ui.GeoAppViewModel
import de.floriantimm.geoapp.ui.elements.Button
import de.floriantimm.geoapp.ui.theme.GeoAppTheme


@Composable
fun Homepage(modifier: Modifier = Modifier, viewModel: GeoAppViewModel, onTheodolite: () -> Unit, onPentagonPrism: () -> Unit) {
    Column(modifier = modifier.fillMaxSize()) {
        if (viewModel.stationed()) {
            Text(text = stringResource(R.string.stationed))
        }
        Button(text = stringResource(R.string.theodolit)) {
            onTheodolite()
        }
        if (viewModel.measureLineExists()) {
            Text(text = stringResource(R.string.measurelineexists))
        }
        Button(text = stringResource( R.string.pentagonprism)) {
            onPentagonPrism()
        }
        
    }
}


@Preview(showBackground = true)
@Composable
fun HomepagePreview() {
    GeoAppTheme {
        Homepage(modifier = Modifier, viewModel = GeoAppViewModel(), onTheodolite = {}, onPentagonPrism = {})
    }
}