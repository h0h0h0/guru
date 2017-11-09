import Promise from 'bluebird'

export default class LocalModel {

  constructor(model, callbacks) {
    window.mod = this
    this.callbacks            = callbacks
    this.originalModel        = model
    this.accountDefaultScreen = model.accountDefaultScreen
    this.user                 = model.user
    this.plans                = model.plans
    this.startedWithPlans     = this.originalModel.user.currentPlans != null
    this.selectedPlans        = this.getDefaultPlans()
    this.error                = ''
    this.redirectAfterLogin   = model.redirectAfterLogin
    // Collaboration
    this.canCreateTeam        = model.canCreateTeam
    this.isTeam               = this.isTeam()
    this.isUser               = this.isUser()
  }

  // Infer the plans based on what they may currently have selected, and what they may be trying to select
  getDefaultPlans() {
    let obj = {
      platform      : 'deploy',
      collaboration : 'solo',
      support       : 'community',
      teamName      : this.getTeamName()
    }
    // Set the values based on the current plans
    if(this.startedWithPlans){
      if(this.originalModel.user.currentPlans.platform != null)
        obj.platform = this.originalModel.user.currentPlans.platform
      if(this.originalModel.user.currentPlans.collaboration != null)
        obj.collaboration = this.originalModel.user.currentPlans.collaboration
      if(this.originalModel.user.currentPlans.support != null)
        obj.support = this.originalModel.user.currentPlans.support
    }
    // Set the user's default selection if there is one
    if(this.originalModel.planSelection != null){
      if(this.originalModel.planSelection.choice != null){
        if(this.originalModel.planSelection.category != null){
          obj[this.originalModel.planSelection.category] = this.originalModel.planSelection.choice
        }
      }
    }
    return obj
  }

  getTeamName() {return this.originalModel.user.teamName != null ? this.originalModel.user.teamName : '' }

  // Ensure the team name is valid
  validateTeamName(cb) {
    if(this.selectedPlans.collaboration != 'solo' ){
      if(this.user.teamName != this.selectedPlans.teamName){
        this.callbacks.validateTeamName(this.selectedPlans.teamName, cb)
        return
      }
    }
    cb({})
  }

  // When the user is ready to submit everything, run all of the following
  submit = (paymentMethod, cb)=>{
    this.paymentMethod = paymentMethod
    this.changePlan('collaboration')
    .then(this.addPaymentMethod)
    .then(this.changePlan.bind(this, 'platform'))
    .then(this.changePlan.bind(this, 'support'))
    .then(cb)
    .then(this.callbacks.saveComplete)
    .catch((error)=>{
      this.error = error.message
      cb()
    })
  }

  // Add a payment method if needed
  addPaymentMethod = ()=> {
    return new Promise((resolve, reject)=>{
      if(this.originalModel.user.hasPaymentMethod)
        resolve()
      else{
        this.callbacks.createPaymentMethod(this.paymentMethod.kind, this.paymentMethod.nonce, (results)=>{
          this.handleCbResults(results, resolve, reject)
        })
      }
    })
  }

  // After validating that the user's selection requires a save,
  // call the callback that will save the user's plan choide
  // @category : ex - 'platform', 'collaboration', 'support'
  changePlan(category) {
    return new Promise((resolve, reject)=>{
      // If the new plan matches the old plan, no need to change it
      if(this.startedWithPlans){
        if(this.selectedPlans[category] == this.originalModel.user.currentPlans[category]){
          resolve()
          return
        }
      }
      // This is a legitimate new plan, change it
      this.callbacks.changePlan(category, this.selectedPlans[category], (results)=>{
        this.handleCbResults(results, resolve, reject)
      })
    })
  }

  handleCbResults(results, resolve, reject) {
    if(results.error != null)
      reject(new Error(results.error))
    else
      resolve()
  }

  // ------------------------------------ Helpers

  isTeam() {
    if(!this.startedWithPlans)
      return false
    if(this.originalModel.user.currentPlans.collaboration == 'solo')
      return false
    return true
  }

  isUser() {
    if(!this.startedWithPlans)
      return false
    if(this.originalModel.user.currentPlans.collaboration == 'solo')
      return true
    return false
  }

}
