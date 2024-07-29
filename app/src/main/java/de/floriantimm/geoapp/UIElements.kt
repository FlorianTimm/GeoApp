package de.floriantimm.geoapp

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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun NumberTextField(label: String, value: Double? = null, newValue: (Double) -> Unit) {
    var input by rememberSaveable { mutableStateOf(value?.toString() ?: "") }
    TextField(
        modifier = Modifier
            .fillMaxWidth()
            .padding(10.dp),
        value = input,
        //placeholder = { Text("Label") },
        onValueChange = { text: String ->
            if (text.isNotEmpty()) {
                try {
                    val ohneKomma = text.replace(",", ".")
                    val ohneKommaMitNull = "0$ohneKomma"
                    newValue(ohneKommaMitNull.toDouble())
                    input = ohneKomma

                } catch (e: NumberFormatException) {
                    // do nothing
                }
            } else {
                newValue(0.0)
                input = ""
            }

        },

        textStyle = MaterialTheme.typography.bodyLarge,
        label = { Text(label) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
    )
}

@Composable
fun HeadlineMedium(text: String) {
    Text(
        text,
        textAlign = TextAlign.Center,
        style = MaterialTheme.typography.headlineMedium,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.fillMaxWidth().padding(10.dp)
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ComboBox(label: String, liste: List<String>) {
    // https://alexzh.com/jetpack-compose-dropdownmenu/
    val context = LocalContext.current
    var expanded by remember { mutableStateOf(false) }
    var selectedText by remember { mutableStateOf("") }

    Box(
        modifier = Modifier .fillMaxWidth().padding(10.dp)


    ) {
        ExposedDropdownMenuBox(
            modifier = Modifier.fillMaxWidth(),
            expanded = expanded,
            onExpandedChange = {
                expanded = !expanded
            }
        ) {
            TextField(
                value = selectedText,
                onValueChange = { selectedText = it },
                label = { Text(text = label) },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )

            val filteredOptions =
                liste.filter { it.contains(selectedText, ignoreCase = true) }
            if (filteredOptions.isNotEmpty()) {
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = {
                        // We shouldn't hide the menu when the user enters/removes any character
                    }
                ) {
                    filteredOptions.forEach { item ->
                        DropdownMenuItem(
                            text = { Text(text = item) },
                            onClick = {
                                selectedText = item
                                expanded = false
                                Toast.makeText(context, item, Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun NumberTextFieldPreview() {
    NumberTextField("Hochwert") {}
}

@Preview(showBackground = true)
@Composable
fun HeadlineMediumPreview() {
    HeadlineMedium("Hochwert")
}

@Preview(showBackground = true)
@Composable
fun ComboBoxPreview() {
    ComboBox("Punktnummer", listOf("A100", "B200", "C300"))
}