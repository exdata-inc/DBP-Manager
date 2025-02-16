import * as React from 'react';
import { Provider } from 'react-redux';
import { getConfigureStore } from 'harmoware-vis';
import HarmowareVISWrapper from '../components/HarmowareVISWrapper';
import HarmowareVISContext from '../providers/HarmowareVISContext';
import '../etc/harmoware-vis.scss';

const store = getConfigureStore();

export default function HarmowareVISPage() {
  return (
    <React.Fragment>
      <Provider store={store} context={HarmowareVISContext}>
        <HarmowareVISWrapper />
      </Provider>
    </React.Fragment>
  );
}

