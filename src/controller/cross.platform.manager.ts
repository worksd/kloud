/* eslint-disable no-underscore-dangle */

class CrossPlatformManager {
  private _crossPlatformController: CrossPlatformController;

  constructor(crossPlatformController: CrossPlatformController) {
    this._crossPlatformController = crossPlatformController;
  }

  get crossPlatformController(): CrossPlatformController {
    return this._crossPlatformController;
  }

  set crossPlatformController(value: CrossPlatformController) {
    this._crossPlatformController = value;
  }
}

export default CrossPlatformManager;
