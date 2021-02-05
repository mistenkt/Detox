const _ = require('lodash');
const DetoxConfigError = require('./DetoxConfigError');

class TodoError extends Error {
  constructor(message, args) {
    super(`TODO - ${message}\n` + JSON.stringify(args));
  }
}

const J = s => JSON.stringify(s);

class DetoxConfigErrorBuilder {
  constructor() {
    this.setDetoxConfigPath();
    this.setDetoxConfig();
    this.setConfigurationName();
  }

  setDetoxConfigPath(filepath) {
    this.filepath = filepath || '';
    return this;
  }

  setDetoxConfig(contents) {
    this.contents = contents || null;
    return this;
  }

  setConfigurationName(configurationName) {
    this.configurationName = configurationName || '';
    return this;
  }

  get selectedConfiguration() {
    return _.get(this.contents, ['configurations', this.configurationName]);
  }

  getSelectedDeviceConfig(alias) {
    if (alias) {
      return this.contents.devices[alias];
    } else {
      return this.selectedConfiguration;
    }
  }

  noConfigurationSpecified() {
    return new DetoxConfigError({
      message: 'Cannot run Detox without a configuration.',
      hint: this.filepath.endsWith('package.json')
        ? `Create an external .detoxrc.json configuration, or add "detox" configuration section to your package.json at:\n${this.filepath}`
        : 'Make sure to create external .detoxrc.json configuration in the working directory before you run Detox.'
    });
  }

  noConfigurationAtGivenPath() {
    return new DetoxConfigError({
      message: 'Failed to find Detox config at:\n' + this.filepath,
      hint: 'Make sure the specified path is correct.',
    });
  }

  failedToReadConfiguration(unknownError) {
    return new DetoxConfigError({
      message: 'An error occurred while trying to load Detox config from:\n' + this.filepath,
      debugInfo: unknownError && unknownError.message,
    });
  }

  noConfigurationsInside() {
    return new DetoxConfigError({
      message: `There are no configurations in the given Detox config.`,
      hint: this.filepath && `Examine the config${_atPath(this.filepath)}`,
      debugInfo: {
        configurations: undefined,
        ...this.contents,
      },
      inspectOptions: { depth: 1 },
    });
  }

  cantChooseConfiguration() {
    const configurations = this.contents.configurations;

    return new DetoxConfigError({
      message: `Cannot determine which configuration to use from Detox config${_atPath(this.filepath)}`,
      hint: 'Use --configuration to choose one of the following:\n' + hintConfigurations(configurations),
    });
  }

  noConfigurationWithGivenName() {
    const configurations = this.contents.configurations;

    return new DetoxConfigError({
      message: `Failed to find a configuration named ${J(this.configurationName)} in Detox config${_atPath(this.filepath)}`,
      hint: 'Below are the configurations Detox was able to find:\n' + hintConfigurations(configurations),
    });
  }

  configurationShouldNotBeEmpty() {
    const name = this.configurationName;
    const configurations = this.contents.configurations;

    return new DetoxConfigError({
      message: `Cannot use an empty configuration ${J(name)}.`,
      hint: `A valid configuration should have "device" and "app" properties defined.\nExamine your Detox config${_atPath(this.filepath)}`,
      debugInfo: {
        configurations: {
          [name]: configurations[name],
          ...configurations,
        }
      },
      inspectOptions: { depth: 1 }
    });
  }

  thereAreNoDeviceConfigs(deviceAlias) {
    const hint = `\
You should create a dictionary of device configurations in Detox config, e.g.:
{
  "devices": {
*-> ${J(deviceAlias)}: {
|     "type": "ios.simulator", // or "android.emulator", or etc...
|     "device": { "type": "iPhone 12" }, // or e.g.: { "avdName": "Pixel_API_29" }
|   }
| },
| "configurations": {
|   ${J(this.configurationName)}: {
*---- "device": ${J(deviceAlias)},
      ...
    }
  }
}\n`;

    return new DetoxConfigError({
      message: `Cannot use aliases since there is no "devices" config in Detox config${_atPath(this.filepath)}`,
      hint,
    });
  }

  cantResolveDeviceAlias(alias) {
    return new DetoxConfigError({
      message: `Failed to find a device config ${J(alias)} in the "devices" dictionary of Detox config${_atPath(this.filepath)}`,
      hint: 'Below are the device configurations Detox was able to find:\n' + hintConfigurations(this.contents.devices)
    });
  }

  deviceConfigIsUndefined() {
    return new DetoxConfigError({
      message: `Failed to find a "device" config in the selected ${J(this.configurationName)} configuration:`,
      hint: `There should be an inlined object or an alias to the device config.\nExamine your Detox config${_atPath(this.filepath)}`,
      debugInfo: this._focusOnConfiguration(),
      inspectOptions: { depth: 2 }
    });
  }

  missingDeviceType(deviceAlias) {
    return new DetoxConfigError({
      message: `Missing "type" inside the device configuration.`,
      hint: `Usually, "type" property should hold the device type to test on (e.g. "ios.simulator" or "android.emulator").\n` +
            `Check that in your Detox config${_atPath(this.filepath)}`,
      debugInfo: this._focusOnDeviceConfig(deviceAlias),
      inspectOptions: { depth: 3 },
    });
  }

  malformedAppLaunchArgs() {
    return new TodoError('malformedAppLaunchArgs', arguments);

    // return new DetoxConfigError({
    //   message: `Invalid type of "launchArgs" property in detox.configurations["${this.configurationName}"]\nExpected an object.`,
    //   hint: `Check that in your Detox config${_atPath(this.filepath)}`,
    //   debugInfo: this._focusOnConfiguration(),
    //   inspectOptions: { depth: 2 },
    // });
  }

  malformedUtilBinaryPaths() {
    return new TodoError('malformedUtilBinaryPaths', arguments);

    // return new DetoxConfigError({
    //   message: `Invalid type of "utilBinaryPaths" property in detox.configurations["${this.configurationName}"]\nExpected an array of strings of paths.`,
    //   hint: `Check that in your Detox config${_atPath(this.filepath)}`,
    //   debugInfo: this._focusOnConfiguration(),
    //   inspectOptions: { depth: 2 },
    // });
  }

  missingAppBinaryPath() {
    return new TodoError('missingAppBinaryPath', arguments);
  }

  invalidAppType() {
    return new TodoError('invalidAppType', arguments);
  }

  duplicateAppConfig() {
    return new TodoError('duplicateAppConfig', arguments);
  }

  noAppIsDefined() {
    return new TodoError('noAppIsDefined', arguments);
  }

  ambiguousAppAndApps() {
    return new TodoError('ambiguousAppAndApps', arguments);
  }

  multipleAppsConfigArrayTypo() {
    return new TodoError('multipleAppsConfigArrayTypo', arguments);
  }

  multipleAppsConfigShouldBeArray() {
    return new TodoError('multipleAppsConfigShouldBeArray', arguments);
  }

  missingDeviceProperty(deviceAlias, expectedProperties) {
    const { type } = this.getSelectedDeviceConfig(deviceAlias);
    return new DetoxConfigError({
      message: `Missing or empty "device" property inside the device config.`,
      hint: `It should have the device query to run on, e.g.:\n
{
  "type": ${J(type)},
  "device": ${expectedProperties.map(p => `{ ${J(p)}: ... }`).join('\n      // or ')}
}
Check that in your Detox config${_atPath(this.filepath)}`,
      debugInfo: this._focusOnDeviceConfig(deviceAlias),
      inspectOptions: { depth: 3 },
    });
  }

  missingDeviceMatcherProperties() {
    return new TodoError('missingDeviceMatcherProperties', arguments);
  }

  invalidServerProperty() {
    return new DetoxConfigError({
      message: `session.server property is not a valid WebSocket URL`,
      hint: `Expected something like "ws://localhost:8099".\nCheck that in your Detox config${_atPath(this.filepath)}`,
      inspectOptions: { depth: 3 },
      debugInfo: _.omitBy({
        session: _.get(this.contents, ['session']),
        ...this._focusOnConfiguration(c => _.pick(c, ['session'])),
      }, _.isEmpty),
    });
  }

  invalidSessionIdProperty() {
    return new DetoxConfigError({
      message: `session.sessionId property should be a non-empty string`,
      hint: `Check that in your Detox config${_atPath(this.filepath)}`,
      inspectOptions: { depth: 3 },
      debugInfo: _.omitBy({
        session: _.get(this.contents, ['session']),
        ...this._focusOnConfiguration(c => _.pick(c, ['session'])),
      }, _.isEmpty),
    });
  }

  invalidDebugSynchronizationProperty() {
    return new DetoxConfigError({
      message: `session.debugSynchronization should be a positive number`,
      hint: `Check that in your Detox config${_atPath(this.filepath)}`,
      inspectOptions: { depth: 3 },
      debugInfo: _.omitBy({
        session: _.get(this.contents, ['session']),
        ...this._focusOnConfiguration(c => _.pick(c, ['session'])),
      }, _.isEmpty),
    });
  }

  missingBuildScript() {
    return new DetoxConfigError({
      message: `Could not find a build script inside "${this.configurationName}" configuration.`,
      hint: `Check contents of your Detox config${_atPath(this.filepath)}`,
      debugInfo: this._focusOnConfiguration(),
      inspectOptions: { depth: 2 },
    });
  }

  _focusOnConfiguration(postProcess = _.identity) {
    const configuration = _.get(this.contents, ['configurations', this.configurationName]);
    if (configuration === undefined) {
      return;
    }

    return {
      configurations: {
        [this.configurationName]: postProcess(configuration)
      },
    };
  }

  _focusOnDeviceConfig(deviceAlias) {
    if (!deviceAlias) {
      return this._focusOnConfiguration();
    }

    const { device } = this.selectedConfiguration;

    return {
      devices: {
        [device]: this.contents.devices[device],
      },
    };
  }
}

function hintConfigurations(configurations) {
  return _.keys(configurations).map(c => `* ${c}`).join('\n')
}

function _atPath(configPath) {
  return configPath ? ` at path:\n${configPath}` : '.';
}

module.exports = DetoxConfigErrorBuilder;
