export function dateFormatter (date){
    return new Intl.DateTimeFormat('en-US', 
    {year: 'numeric', month: '2-digit',day: '2-digit'})
    .format(date)
 }
 
 export function isValidData(object) {
  var flag = true;
  if (!object) return false
  for (const [key, value] of Object.entries(object)){
      if(key in object){
        if(value === "" || value === null || value === undefined) {
          flag = false;
          break;
        }
      }
   }
    
   return flag;
 }
 
 export async function  callFunctionWithErrorHandling(command, method, options, params, apiClient) {
    var message = [];
    var funcErrorMsg = "";
    try {
      const response = await apiClient.request({
        method: method,
        url: command,
        data: options,
        params
      });
      message = response.data;
    } catch (err) {
      if (err.response && err.response.status && err.response.status === 404) {
        funcErrorMsg =
          'There may be a problem with the deployment of Azure Function App, please deploy Azure Function (Run command palette "TeamsFx - Deploy Package") first before running this App';
      } else if (err.message === "Network Error") {
        funcErrorMsg =
          "Cannot call Azure Function due to network error, please check your network connection status and ";
        if (err.config.url.indexOf("localhost") >= 0) {
          funcErrorMsg +=
            'make sure to start Azure Function locally (Run "npm run start" command inside api folder from terminal) first before running this App';
        } else {
          funcErrorMsg +=
            'make sure to provision and deploy Azure Function (Run command palette "TeamsFx - Provision Resource" and "TeamsFx - Deploy Package") first before running this App';
        }
      } else {
        funcErrorMsg = err.toString();
        if (err.response?.data?.error) {
          funcErrorMsg += ": " + err.response.data.error;
        }
        alert(funcErrorMsg);
      }
    }
    return message;
 }