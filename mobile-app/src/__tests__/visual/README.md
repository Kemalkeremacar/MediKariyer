# Visual Regression Testing

This directory contains visual regression tests for the MediKariyer mobile application. These tests use Jest snapshots to detect unintended visual changes in UI components and screens.

## Test Structure

### ComponentSnapshots.test.tsx
Tests all major UI components with various variants, sizes, and states:
- **Button Component**: All variants (primary, secondary, outline, ghost), sizes (sm, md, lg), and states (loading, disabled, full-width)
- **Card Component**: All variants (elevated, outlined, filled) with different padding sizes and pressable states
- **Badge Component**: All status types (pending, accepted, rejected, reviewed) and variant-based badges
- **Component Combinations**: Tests common component combinations like cards with buttons and badges

### ScreenSnapshots.test.tsx
Tests all major application screens:
- **Dashboard Screen**: With data and various states
- **Jobs Screen**: With job listings
- **Applications Screen**: With applications list
- **Profile Screen**: With tabbed navigation
- **Notifications Screen**: With notifications list

## Running Tests

```bash
# Run all visual regression tests
npm test -- src/__tests__/visual

# Run component snapshots only
npm test -- src/__tests__/visual/ComponentSnapshots.test.tsx

# Run screen snapshots only
npm test -- src/__tests__/visual/ScreenSnapshots.test.tsx

# Update snapshots after intentional changes
npm test -- src/__tests__/visual -u
```

## Snapshot Management

### When to Update Snapshots
Update snapshots when you've made intentional visual changes:
1. Modified component styling or layout
2. Updated theme values (colors, spacing, typography)
3. Changed component structure or props
4. Refactored components while maintaining visual appearance

### Reviewing Snapshot Changes
Before updating snapshots:
1. Review the diff carefully to ensure changes are intentional
2. Test the component/screen manually to verify visual appearance
3. Ensure changes align with design system guidelines
4. Update snapshots using `npm test -- -u`

## Dark Mode Testing

**Note**: Dark mode snapshot testing is currently limited due to Jest module caching issues. The current implementation tests components in light mode only.

For comprehensive dark mode testing, consider using visual regression tools that can capture actual screenshots:
- **Chromatic**: Automated visual testing for Storybook
- **Percy**: Visual testing and review platform
- **Applitools**: AI-powered visual testing
- **Detox**: E2E testing framework with screenshot capabilities

## Responsive Layout Testing

Responsive layout testing across different screen sizes is better handled by E2E testing tools like:
- **Detox**: Can test on actual devices with different screen sizes
- **Maestro**: Mobile UI testing framework
- **Appium**: Cross-platform mobile automation

To test responsive layouts in Jest, you would need to mock the `Dimensions` API, but this doesn't provide the same confidence as testing on actual devices.

## Best Practices

1. **Keep Snapshots Small**: Test individual components rather than entire app trees
2. **Test Variants Separately**: Create separate tests for each component variant
3. **Use Descriptive Test Names**: Make it clear what each snapshot represents
4. **Review Diffs Carefully**: Always review snapshot diffs before updating
5. **Commit Snapshots**: Snapshot files should be committed to version control
6. **Update Regularly**: Keep snapshots up-to-date with intentional changes

## Limitations

### Current Limitations
- Dark mode testing requires alternative approaches
- Responsive layout testing is limited without actual device dimensions
- Animation states are not captured in snapshots
- Interactive states (hover, focus) are not tested

### Recommended Complementary Testing
- **Unit Tests**: Test component logic and behavior
- **Integration Tests**: Test component interactions and data flow
- **E2E Tests**: Test complete user workflows on actual devices
- **Manual Testing**: Visual QA on actual devices in both light and dark modes
- **Accessibility Tests**: Verify touch targets, color contrast, and screen reader support

## Maintenance

### Regular Maintenance Tasks
1. Review and update snapshots after design system changes
2. Remove obsolete snapshots for deleted components
3. Add new snapshots for new components
4. Keep test mocks up-to-date with API changes
5. Document any known issues or limitations

### Troubleshooting

**Tests are slow or hanging**:
- Increase test timeout for complex screens
- Simplify test setup by reducing mock data
- Consider testing smaller component units

**Snapshots are too large**:
- Break down tests into smaller units
- Test individual components rather than full screens
- Remove unnecessary mock data

**Frequent snapshot updates**:
- May indicate unstable component implementation
- Check for dynamic values (timestamps, IDs) in snapshots
- Consider using snapshot serializers to normalize dynamic data

## Contributing

When adding new visual regression tests:
1. Follow the existing test structure and naming conventions
2. Add tests for all component variants and states
3. Include descriptive comments explaining what is being tested
4. Update this README if adding new test categories
5. Ensure tests pass before committing

## Resources

- [Jest Snapshot Testing](https://jestjs.io/docs/snapshot-testing)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
