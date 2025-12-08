module.exports = function (api) {
  api.cache(true);
  
  const plugins = [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/features': './src/features',
          '@/api': './src/api',
          '@/store': './src/store',
          '@/hooks': './src/hooks',
          '@/utils': './src/utils',
          '@/theme': './src/theme',
          '@/types': './src/types',
          '@/config': './src/config',
          '@/navigation': './src/navigation',
          '@/contexts': './src/contexts',
          '@/providers': './src/providers',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ];

  // Production ortamında console.log'ları kaldır
  if (process.env.NODE_ENV === 'production') {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};

