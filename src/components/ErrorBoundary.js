/*import React from 'react';
import { View, Text } from 'react-native';
import * as Sentry from "@sentry/react-native";

export default class RenderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.Native.captureException(error);
    Sentry.captureMessage('Error al renderizar componente', 'error');
    console.error('❌ Error de render:', error, errorInfo);
    this.setState({ hasError: true, errorMessage: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Ocurrió un error al renderizar</Text>
          <Text>{this.state.errorMessage}</Text>
          <Text>El error ha sido enviado a Sentry</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
*/