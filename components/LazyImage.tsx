import React, { useState } from 'react';
import { 
  Image, 
  ImageProps, 
  ActivityIndicator, 
  View, 
  StyleSheet,
  ImageSourcePropType
} from 'react-native';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType | { uri: string };
  placeholderColor?: string;
  spinnerColor?: string;
  spinnerSize?: number | 'small' | 'large';
}

/**
 * LazyImage component that shows a loading spinner while the image is loading
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  style,
  placeholderColor = '#f5f5f5',
  spinnerColor = '#000',
  spinnerSize = 'small',
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: placeholderColor },
          styles.placeholder
        ]}
      >
        {loading && !error && (
          <ActivityIndicator 
            color={spinnerColor} 
            size={spinnerSize} 
            style={styles.spinner} 
          />
        )}
      </View>
      <Image
        {...props}
        source={source}
        style={[
          style,
          { opacity: loading || error ? 0 : 1 }
        ]}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    position: 'absolute',
  }
});
