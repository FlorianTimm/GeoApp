package de.floriantimm.geoapp

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import de.floriantimm.geoapp.ui.theme.GeoAppTheme

@Composable
fun Theodolit(modifier: Modifier = Modifier) {
    Surface(modifier = modifier) {
        Column {
            HeadlineMedium("Lage I")
            ComboBox(label = "Punktnummer", liste = listOf("A100", "B200", "C300"))
            NumberTextField("Horizontalrichtung") {            }
            NumberTextField("Zenitwinkel") {            }
            NumberTextField("Strecke") {            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun theodolitPreview() {
    GeoAppTheme {
        Theodolit()
    }
}