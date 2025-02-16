import * as React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { taskMiddleware } from 'react-palm/tasks';
import KeplerGl from 'kepler.gl';
import keplerGlReducer from 'kepler.gl/reducers';
import { addDataToMap } from "kepler.gl/actions";
import useSwr from "swr";

const Map = (props: any) => {
  const dispatch = useDispatch();
  const { data } = useSwr("covid", async () => {
    const response = await fetch(
      "https://gist.githubusercontent.com/leighhalliday/a994915d8050e90d413515e97babd3b3/raw/a3eaaadcc784168e3845a98931780bd60afb362f/covid19.json"
    );
    const data = await response.json();
    return data;
  });

  React.useEffect(() => {
    if (data) {
      dispatch(
        addDataToMap({
          datasets: {
            info: {
              label: "COVID-19",
              id: "covid19"
            },
            data
          },
          option: {
            centerMap: true,
            readOnly: false
          },
          config: {}
        })
      );
    }
  }, [dispatch, data]);

  return (
    <KeplerGl
      id="foo"
      mapboxApiAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      width={500}
      height={500} />
  );
};

const store = configureStore({
  reducer: {
    keplerGl: keplerGlReducer
  },
  middleware: [taskMiddleware]
})

export default function KeplerGLPage() {
  return (
    <React.Fragment>
      <Provider store={store}>
        <Map />
      </Provider>
    </React.Fragment>
  );
}

