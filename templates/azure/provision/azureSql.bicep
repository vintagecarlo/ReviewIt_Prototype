@secure()
param provisionParameters object
var resourceBaseName = provisionParameters.resourceBaseName
var sqlServerName = contains(provisionParameters, 'sqlServerName') ? provisionParameters['sqlServerName'] : '${resourceBaseName}' // Try to read name for SQL Server from parameters
var sqlDatabaseName = contains(provisionParameters, 'sqlDatabaseName') ? provisionParameters['sqlDatabaseName'] : '${resourceBaseName}' // Try to read name for SQL Database from parameters
var sqlDatabaseSku = contains(provisionParameters, 'sqlDatabaseSku') ? provisionParameters['sqlDatabaseSku'] : 'Basic' // Try to read SKU for SQL Database from parameters
var administratorLogin = contains(provisionParameters, 'azureSqlAdmin') ? provisionParameters['azureSqlAdmin'] : '' // Try to read admin name for SQL Server from parameters, the value must be empty or same with the admin name used to create SQL Server
var administratorLoginPassword = contains(provisionParameters, 'azureSqlAdminPassword') ? provisionParameters['azureSqlAdminPassword'] : '' // Try to read admin password for SQL Server from parameters, empty means do not update admin password

// SQL Server that hosts the databases
// The symbolic name of SQL Server will be referenced as parent when adding nmultiple databases
resource sqlServer 'Microsoft.Sql/servers@2021-05-01-preview' = {
  location: resourceGroup().location
  name: sqlServerName
  properties: {
    minimalTlsVersion:'1.2'
    administratorLogin: empty(administratorLogin) ? null : administratorLogin
    administratorLoginPassword: administratorLoginPassword
  }
}

// SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-05-01-preview' = {
  parent: sqlServer
  location: resourceGroup().location
  name: sqlDatabaseName
  sku: {
    name: sqlDatabaseSku // You can follow https://aka.ms/teamsfx-bicep-add-param-tutorial to add sqlDatabaseSku property to provisionParameters to override the default value "Basic".
  }
}

// Allow Azure services connect to the SQL Server
resource sqlFirewallRules 'Microsoft.Sql/servers/firewallRules@2021-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzure'
  properties: {
    endIpAddress: '0.0.0.0'
    startIpAddress: '0.0.0.0'
  }
}

output sqlResourceId string = sqlServer.id
output sqlEndpoint string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabaseName// database added with name suffix [b3d1ac]
var sqlDatabaseName_b3d1ac = contains(provisionParameters, 'sqlDatabaseName_b3d1ac') ? provisionParameters['sqlDatabaseName_b3d1ac'] : '${resourceBaseName}_b3d1ac'
var sqlDatabaseSku_b3d1ac = contains(provisionParameters, 'sqlDatabaseSku_b3d1ac') ? provisionParameters['sqlDatabaseSku_b3d1ac'] : 'Basic'

resource sqlDatabase_b3d1ac 'Microsoft.Sql/servers/databases@2021-05-01-preview' = {
  // parent should refer to resource symbolic name of SQL server
  parent: sqlServer
  location: resourceGroup().location
  name: sqlDatabaseName_b3d1ac
  sku: {
    name: sqlDatabaseSku_b3d1ac 
  }
}

output databaseName_b3d1ac string = sqlDatabaseName_b3d1ac// database added with name suffix [1585d4]
var sqlDatabaseName_1585d4 = contains(provisionParameters, 'sqlDatabaseName_1585d4') ? provisionParameters['sqlDatabaseName_1585d4'] : '${resourceBaseName}_1585d4'
var sqlDatabaseSku_1585d4 = contains(provisionParameters, 'sqlDatabaseSku_1585d4') ? provisionParameters['sqlDatabaseSku_1585d4'] : 'Basic'

resource sqlDatabase_1585d4 'Microsoft.Sql/servers/databases@2021-05-01-preview' = {
  // parent should refer to resource symbolic name of SQL server
  parent: sqlServer
  location: resourceGroup().location
  name: sqlDatabaseName_1585d4
  sku: {
    name: sqlDatabaseSku_1585d4 
  }
}

output databaseName_1585d4 string = sqlDatabaseName_1585d4