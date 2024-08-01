package de.floriantimm.geoapp.ui.elements

import android.widget.Toast
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import de.floriantimm.geoapp.R


@Composable
fun HeadlineMedium(text: String) {
    Text(
        text,
        textAlign = TextAlign.Center,
        style = MaterialTheme.typography.headlineMedium,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier
            .fillMaxWidth()
            .padding(10.dp)
    )
}


@Composable
fun Button(text: String, modifier: Modifier = Modifier, enabled:  Boolean = true, onClick: () -> Unit) {
    androidx.compose.material3.Button(
        onClick = onClick,
        shape = MaterialTheme.shapes.medium,
        content = { Text(text) },
        enabled = enabled,
        modifier = modifier
            .fillMaxWidth()
            .padding(10.dp))
}


@Preview(showBackground = true)
@Composable
fun HeadlineMediumPreview() {
    HeadlineMedium(stringResource(R.string.theodolit))
}



@Preview(showBackground = true)
@Composable
fun ButtonPreview() {
    Button(stringResource(R.string.speichern)) {}
}