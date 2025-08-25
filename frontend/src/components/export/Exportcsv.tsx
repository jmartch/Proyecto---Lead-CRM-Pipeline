import React, { useState, useRef } from 'react'
import Button from '../buttons/Button'

const Exportcsv = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>
            {/* Botón personalizado */}
            <Button >
                {isLoading ? 'Exportando...' : 'Exportar Leads (CSV)'}
            </Button>
        </div>
    )
}

export default Exportcsv