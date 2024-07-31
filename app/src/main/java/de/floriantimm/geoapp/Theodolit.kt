package de.floriantimm.geoapp

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun Theodolit(
    modifier: Modifier = Modifier,
    horizontalAngle: Double? = null,
    zenithAngle: Double? = null,
    distance: Double? = null
) {
    Surface(modifier = modifier) {
        Column {
            HeadlineMedium(stringResource(R.string.lage) + " I")
            ComboBox(
                label = stringResource(R.string.punktnummer),
                liste = listOf("A100", "B200", "C300")
            )
            NumberTextField(stringResource(R.string.horizontalrichtung), horizontalAngle) { }
            NumberTextField(stringResource(R.string.zenitwinkel), zenithAngle) { }
            NumberTextField(stringResource(R.string.strecke), distance) { }
            Button(
                stringResource(R.string.speichern),
                {},
                enabled = (horizontalAngle != null && zenithAngle != null && distance != null)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun TheodolitPreview() {
    GeoAppTheme {
        Theodolit()
    }
}