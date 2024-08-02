package de.floriantimm.geoapp.ui.elements

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import de.floriantimm.geoapp.R
import de.floriantimm.geoapp.ui.GeoAppViewModel


@Composable
fun PointComboBox(label: String = stringResource(R.string.punktnummer), viewModel: GeoAppViewModel = GeoAppViewModel(), value: String? = null, onChanged: (String) -> Unit) {
    ComboBox(
        label = label,
        itemList = viewModel.getPoints(),
        value
    ) {
       onChanged(it)
    }
}

@Preview(showBackground = true)
@Composable
fun PointComboBoxPreview() {
    PointComboBox {}
}