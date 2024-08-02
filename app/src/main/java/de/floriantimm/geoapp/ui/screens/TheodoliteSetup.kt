package de.floriantimm.geoapp.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun TheodoliteSetup(modifier: Modifier = Modifier, viewModel: GeoAppViewModel = GeoAppViewModel(), onSave: () -> Unit) {
    var tabIndex by rememberSaveable { mutableStateOf(0) }
    Column {
        TabRow(modifier = modifier, selectedTabIndex = tabIndex) {
            Tab(selected = tabIndex == 0, onClick = { tabIndex = 0 }) {
                Text(text = stringResource(R.string.setup))
            }
            Tab(selected = tabIndex == 1, onClick = { tabIndex = 1 }) {
                Text(text = stringResource(R.string.measure))
            }
            Tab(selected = tabIndex == 2, onClick = { tabIndex = 2 }) {
                Text(text = stringResource(R.string.result))
            }
        }
        val pagerState = rememberPagerState {3}

        LaunchedEffect(key1 = tabIndex) {
            pagerState.animateScrollToPage(tabIndex)
        }

        LaunchedEffect(key1 = pagerState.currentPage, pagerState.isScrollInProgress) {
            if (!pagerState.isScrollInProgress)
                tabIndex = pagerState.currentPage
        }

        HorizontalPager(
            state = pagerState
        ) {tabIndex ->
            Column (modifier = Modifier.fillMaxWidth().fillMaxHeight()){
                when (tabIndex) {
                    0 -> TheodoliteSetupSettings(viewModel = viewModel, onSave = onSave)
                    1 -> TheodoliteMeasurement(viewModel = viewModel)
                    2 -> TheodoliteMeasurementResult(viewModel = viewModel)
                }

            }
        }


    }

}

@Composable
fun TheodoliteMeasurementResult(viewModel: GeoAppViewModel) {
    Text(text = "TODO")
}

@Composable
fun TheodoliteSetupSettings (modifier: Modifier = Modifier, viewModel: GeoAppViewModel = GeoAppViewModel(), onSave: () -> Unit)  {
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