/// <reference path="../../includes.ts"/>
module Kubernetes {

  /**
   * Sorts the the ip field
   *
   * @param ip the ip such as '10.1.2.13'
   * @returns {any}
   */
  export function sortByPodIp(ip) : any {
    // i guess there is maybe nicer ways of sort this without parsing and slicing
    var regex = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/;
    var groups = regex.exec(ip);
    if (angular.isDefined(groups)) {
      var g1 = ("00" + groups[1]).slice(-3);
      var g2 = ("00" + groups[2]).slice(-3);
      var g3 = ("00" + groups[3]).slice(-3);
      var g4 = ("00" + groups[4]).slice(-3);
      var answer = g1 + g2 + g3 + g4;
      return answer;
    } else {
      return 0;
    }
  }

}