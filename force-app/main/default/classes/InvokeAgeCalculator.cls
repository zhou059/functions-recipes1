public with sharing class InvokeAgeCalculator {
    @AuraEnabled
    public static String calculate_age(String accountName, Date dob) {
        Map<String, String> payload = new Map<String, String>();

        payload.put('accountName', accountName);
        payload.put('dateOfBirth', dob.format());

        return GenericFunctionInvoker.invoke('functions_recipes.agecalculator', JSON.serialize(payload));
    }
}