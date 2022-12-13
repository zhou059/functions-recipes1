/**
 * Describe Agecalculator here.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(`Invoking Agecalculator with payload ${JSON.stringify(event.data || {})}`);

  const today = new Date();
  const payload = event.data;
  const soql = `SELECT Id, Name FROM Account WHERE Name = '${payload.accountName}'`;
  const results = await context.org.dataApi.query(soql);
  
  logger.info(JSON.stringify(results));

  // Calculate date of birth from current year and year of birth
  const age = today.getFullYear() - Number(payload.dateOfBirth.substr(payload.dateOfBirth.length - 4));

  logger.info(age);
  logger.info(results.records[0].fields.id)

  const uow = context.org.dataApi.newUnitOfWork();

  const accountId = uow.registerUpdate ({
    type: "Account",
    fields: {
      id: results.records[0].fields.id,
      name: payload.accountName,
      age__c: age
    }
  });

  try {
    // Commit the Unit of Work with all the previous registered operations
    const response = await context.org.dataApi.commitUnitOfWork(uow);
  } catch (err) {
    const errorMessage = `Failed to update record. Root Cause : ${err.message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return age;
}