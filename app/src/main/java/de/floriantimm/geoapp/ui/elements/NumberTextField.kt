package de.floriantimm.geoapp.ui.elements

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import de.floriantimm.geoapp.R


@Composable
fun NumberTextField(label: String, value: Double? = null, onChanged: (Double?) -> Unit) {
    var inputText by rememberSaveable { mutableStateOf(value?.toString() ?: "") }
    if (value == null) {
        inputText = ""
    }

        TextField(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            value = inputText,
            onValueChange = { text: String ->
                if (text.isNotEmpty()) {
                    try {
                        val ohneKomma = text.replace(",", ".")
                        val ohneKommaMitNull = "0$ohneKomma"
                        onChanged(ohneKommaMitNull.toDouble())
                        inputText = ohneKomma
                    } catch (e: NumberFormatException) {
                        // do nothing
                    }
                } else {
                    onChanged(null)
                }

            },

            textStyle = MaterialTheme.typography.bodyLarge,
            label = { Text(label) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
        )
}


@Preview(showBackground = true)
@Composable
fun NumberTextFieldPreview() {
    NumberTextField(stringResource(R.string.hochwert)) {}
}