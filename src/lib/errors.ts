/* tslint:disable: max-classes-per-file max-line-length */

const messages = {
    AbortError:
        "A request was aborted, for example through a call to IDBTransaction.abort.",
    ConstraintError:
        "A mutation operation in the transaction failed because a constraint was not satisfied. For example, an object such as an object store or index already exists and a request attempted to create a new one.",
    DataCloneError:
        "The data being stored could not be cloned by the internal structured cloning algorithm.",
    DataError: "Data provided to an operation does not meet requirements.",
    InvalidAccessError:
        "An invalid operation was performed on an object. For example transaction creation attempt was made, but an empty scope was provided.",
    InvalidStateError:
        "An operation was called on an object on which it is not allowed or at a time when it is not allowed. Also occurs if a request is made on a source object that has been deleted or removed. Use TransactionInactiveError or ReadOnlyError when possible, as they are more specific variations of InvalidStateError.",
    NotFoundError:
        "The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",
    ReadOnlyError:
        'The mutating operation was attempted in a "readonly" transaction.',
    TransactionInactiveError:
        "A request was placed against a transaction which is currently not active, or which is finished.",
    VersionError:
        "An attempt was made to open a database using a lower version than the existing version.",
};

export function AbortError(message = messages.AbortError): DOMException {
    return new DOMException(message, "AbortError");
}

export function ConstraintError(
    message = messages.ConstraintError
): DOMException {
    return new DOMException(message, "ConstraintError");
}

export function DataCloneError(
    message = messages.DataCloneError
): DOMException {
    return new DOMException(message, "DataCloneError");
}

export function DataError(message = messages.DataError): DOMException {
    return new DOMException(message, "DataError");
}

export function InvalidAccessError(
    message = messages.InvalidAccessError
): DOMException {
    return new DOMException(message, "InvalidAccessError");
}

export function InvalidStateError(
    message = messages.InvalidStateError
): DOMException {
    return new DOMException(message, "InvalidStateError");
}

export function NotFoundError(message = messages.NotFoundError): DOMException {
    return new DOMException(message, "NotFoundError");
}

export function ReadOnlyError(message = messages.ReadOnlyError): DOMException {
    return new DOMException(message, "ReadOnlyError");
}

export function TransactionInactiveError(
    message = messages.TransactionInactiveError
): DOMException {
    return new DOMException(message, "TransactionInactiveError");
}

export function VersionError(message = messages.VersionError): DOMException {
    return new DOMException(message, "VersionError");
}
